import { readAsciiUntilNull } from "../_internal.ts";
import { FileHeader } from "../coff/file_header.ts";
import { SectionHeader } from "../coff/section_header.ts";
import type { BaseNtHeaders } from "./_base_nt_headers.ts";
import { type DataDirectories, DirectoryEntry } from "./data_directories.ts";
import type { DataDirectory } from "./data_directory.ts";
import { ExportDirectory } from "./dir/exports.ts";
import {
  type BaseImageThunkData,
  ImageNamedImport,
  ImageThunkData32,
  ImageThunkData64,
} from "./dir/iat.ts";
import { ImportDirectory } from "./dir/imports.ts";
import { RelocDirectory, type RelocType } from "./dir/relocs.ts";
import { DosHeader } from "./dos_header.ts";
import { NtHeaders32, NtHeaders64 } from "./nt_headers.ts";

/** Base shape shared by all import entries. */
export interface BaseImportInfo {
  /** RVA of the import address table slot for this entry. */
  rva: number;
}

/** An import resolved by name. */
export interface NamedImportInfo extends BaseImportInfo {
  /** The exported symbol name. */
  name: string;
}

/** An import resolved by ordinal number. */
export interface OrdinalImportInfo extends BaseImportInfo {
  /** The ordinal value used to identify the export. */
  ordinal: number;
}

/**
 * A single imported module and its list of imported functions, yielded by
 * {@linkcode PeImage.getImports}.
 */
export interface ModuleImports {
  /** Name of the imported DLL (e.g. `"KERNEL32.dll"`). */
  module: string;
  /** Imported functions from this DLL, each resolved by name or ordinal. */
  functions: (NamedImportInfo | OrdinalImportInfo)[];
}

/** A single base-relocation entry extracted from the `.reloc` section. */
export interface RelocInfo {
  /** Base RVA of the relocation block that contains this entry. */
  baseRva: number;
  /** Page offset within the block (12-bit value). */
  offset: number;
  /** Relocation type that describes how the fix-up should be applied. */
  type: RelocType;
}

/** Describes an export that is forwarded to another DLL. */
export interface ForwardedExportInfo {
  /** Name of the DLL that provides the actual implementation (without `.dll`). */
  library: string;
  /** Name or ordinal string of the forwarded function within that library. */
  function: string;
}

/**
 * A single exported symbol.
 *
 * Exactly one of {@linkcode rva} or {@linkcode forward} will be set for a
 * valid export; both are absent when the function table slot is empty.
 */
export interface ExportInfo {
  /** Symbol name, if the export has one (named export). */
  name?: string;
  /** RVA of the exported function, present for direct (non-forwarded) exports. */
  rva?: number;
  /** Forwarded-export descriptor, present when the symbol is re-exported from another DLL. */
  forward?: ForwardedExportInfo;
}

interface ExportTableViews {
  names: DataView;
  functions: DataView;
  ordinals: DataView;
}

/** Arguments passed to the per-slot export resolution helper. */
interface ExportEntryDesc {
  /** Zero-based index of the function-table slot being resolved. */
  index: number;
  /** Pre-built views over the export name, function, and ordinal tables. */
  views: ExportTableViews;
  /** Number of named exports (bounds the name/ordinal table lookups). */
  numNames: number;
  /** Byte delta applied to convert an RVA to a raw file offset within this section. */
  delta: number;
  /** Raw file offset of the start of the export directory (for forwarded-export detection). */
  dirBegin: number;
  /** Raw file offset of the end of the export directory (for forwarded-export detection). */
  dirEnd: number;
}

/**
 * A parsed PE (Portable Executable) image.
 *
 * Wraps the raw binary data and provides typed, structured access to PE
 * headers, sections, and common data directories such as exports, imports,
 * and base relocations.
 *
 * Construct instances via the {@linkcode loadPeImage} factory function rather
 * than the constructor directly.
 *
 * @example
 * ```ts
 * import { loadPeImage } from "@neonbyte/pe";
 *
 * const pe = await loadPeImage("C:/Windows/System32/kernel32.dll");
 * const exports = pe.collectExports();
 * console.log(`Found ${exports.length} exports`);
 * ```
 */
export class PeImage {
  private readonly sectionOffset: number;
  private readonly sections: SectionHeader[] = [];

  /** Raw binary data of the entire PE image. */
  public readonly data: Uint8Array;

  /** Parsed DOS header (`MZ` stub). */
  public readonly dos: DosHeader;

  /**
   * NT headers. Use the `is32Bit()` / `is64Bit()` helpers on
   * `nt.optionalHdr` to discriminate between the 32-bit and 64-bit variants.
   */
  public readonly nt: BaseNtHeaders;

  /**
   * @param {Uint8Array} data Raw binary data of the entire PE image.
   * @param {DosHeader} dos Parsed DOS header read from `data`.
   * @param {NtHeaders64} nt Parsed 64-bit NT headers read from `data`.
   */
  public constructor(data: Uint8Array, dos: DosHeader, nt: NtHeaders64);
  /**
   * @param {Uint8Array} data Raw binary data of the entire PE image.
   * @param {DosHeader} dos Parsed DOS header read from `data`.
   * @param {NtHeaders32} nt Parsed 32-bit NT headers read from `data`.
   */
  public constructor(data: Uint8Array, dos: DosHeader, nt: NtHeaders32);
  public constructor(
    data: Uint8Array,
    dos: DosHeader,
    nt: NtHeaders64 | NtHeaders32,
  ) {
    this.sectionOffset = dos.nextHdrOffset +
      4 +
      FileHeader.SIZE +
      nt.fileHdr.sizeOptionalHeader;
    this.data = data;
    this.dos = dos;
    this.nt = nt;
  }

  /**
   * All sixteen PE data directories from the Optional Header.
   *
   * @returns {DataDirectories} The data-directory array.
   */
  public get directories(): DataDirectories {
    return this.nt.optionalHdr.directories;
  }

  /**
   * Returns the {@linkcode DataDirectory} entry for the given directory type,
   * or `null` when the directory is absent (RVA or size is zero).
   *
   * @param {DirectoryEntry} id Index of the data directory to retrieve.
   * @returns {DataDirectory | null} The directory entry, or `null` if absent.
   *
   * @example
   * ```ts
   * import { loadPeImage, DirectoryEntry } from "@neonbyte/pe";
   *
   * const pe = await loadPeImage("image.dll");
   * const tls = pe.directory(DirectoryEntry.TLS);
   * if (tls) {
   *   console.log("TLS directory size:", tls.size);
   * }
   * ```
   */
  public directory(id: DirectoryEntry): DataDirectory | null {
    const entry = this.directories.entries[id];

    return entry.present() ? entry : null;
  }

  /**
   * Relative Virtual Address of the image entry point, as declared in the
   * Optional Header.
   *
   * @returns {number} The entry-point RVA, or `0` for DLLs with no entry point.
   */
  public get entryPoint(): number {
    return this.nt.optionalHdr.entryPoint;
  }

  /**
   * Preferred load address of the image, as declared in the Optional Header.
   *
   * @returns {bigint} The image base address (64-bit for PE32+, zero-extended for PE32).
   */
  public get imageBase(): bigint {
    return this.nt.optionalHdr.imageBase;
  }

  /**
   * Total size of the image in memory, including all headers and sections,
   * rounded up to a multiple of `sectionAlignment`.
   *
   * @returns {number} The in-memory image size in bytes.
   */
  public get sizeOfImage(): number {
    return this.nt.optionalHdr.sizeOfImage;
  }

  /**
   * Combined size of all code (`.text`) sections, as declared in the Optional Header.
   *
   * @returns {number} The total code size in bytes.
   */
  public get sizeOfCode(): number {
    return this.nt.optionalHdr.sizeOfCode;
  }

  /**
   * Combined size of all headers (DOS stub, PE signature, COFF header, Optional
   * Header, and section table), rounded up to a multiple of `fileAlignment`.
   *
   * @returns {number} The on-disk header size in bytes.
   */
  public get sizeOfHeaders(): number {
    return this.nt.optionalHdr.sizeOfHeaders;
  }

  /**
   * Maximum valid raw file offset, computed as the end of the last section
   * on-disk (or the security directory, whichever is greater).
   *
   * Use this to validate raw offsets before reading into {@linkcode data}.
   *
   * @returns {number} The raw byte limit.
   */
  public get rawLimit(): number {
    let maxRaw = this.nt.optionalHdr.sizeOfHeaders;

    for (const section of this.getSections()) {
      maxRaw = Math.max(section.ptrRawData + section.sizeRawData, maxRaw);
    }

    const dir = this.directory(DirectoryEntry.Security);

    if (dir !== null) {
      maxRaw = Math.max(dir.rva + dir.size, maxRaw);
    }

    return maxRaw;
  }

  /**
   * Iterates over all section headers in declaration order.
   *
   * Sections are lazily parsed and cached on first access.
   *
   * @returns {IterableIterator<SectionHeader>} Iterator of section headers.
   *
   * @example
   * ```ts
   * for (const section of pe.getSections()) {
   *   console.log(section.name, "->", section.virtualAddress.toString(16));
   * }
   * ```
   */
  public *getSections(): IterableIterator<SectionHeader> {
    for (let i = 0; i < this.nt.fileHdr.numSections; ++i) {
      let section = this.sections[i];

      if (!section) {
        section = new SectionHeader(
          this.data,
          this.sectionOffset + (i * SectionHeader.SIZE),
        );

        this.sections.push(section);
      }

      yield section;
    }
  }

  /**
   * Finds the section that contains the given Relative Virtual Address.
   *
   * @param {number} rva The RVA to look up.
   * @returns {SectionHeader | null} The containing section, or `null`.
   */
  public rvaToSection(rva: number): SectionHeader | null {
    for (const section of this.getSections()) {
      if (section.isRvaInside(rva)) {
        return section;
      }
    }

    return null;
  }

  /**
   * Finds the section that contains the given raw file offset.
   *
   * @param {number} offset The raw file offset to look up.
   * @returns {SectionHeader | null} The containing section, or `null`.
   */
  public fileOffsetToSection(offset: number): SectionHeader | null {
    for (const section of this.getSections()) {
      if (section.isFileOffsetInside(offset)) {
        return section;
      }
    }

    return null;
  }

  /**
   * Converts an RVA to a raw file offset into {@linkcode data}.
   *
   * Returns `0` when the RVA is out of bounds or the length check fails,
   * so callers should treat `0` as an invalid/absent result.
   *
   * @param {number} rva The Relative Virtual Address to resolve.
   * @param {number} [length] Optional byte length used for bounds checking.
   * @returns {number} Raw file offset, or `0` on failure.
   */
  public resolveRva(rva: number, length?: number): number {
    const sec = this.rvaToSection(rva);
    const len = Math.max(length ?? 0, 1);

    if (sec === null) {
      const rvaEnd = this.nt.optionalHdr.sizeOfHeaders;

      if (rva < rvaEnd && (rva + len) <= rvaEnd) {
        return rva;
      }

      return 0;
    }

    // Apply the boundary check
    const offset = rva - sec.virtualAddress;

    if ((offset + len) > sec.sizeRawData) {
      return 0;
    }

    // Return the final data offset
    return sec.ptrRawData + offset;
  }

  /**
   * Converts a raw file offset to a Virtual Address (section-relative).
   *
   * Returns `0` when the offset is out of bounds or no containing section
   * is found outside the header region.
   *
   * @param {number} offset Raw file offset to resolve.
   * @param {number} [length] Optional byte length used for bounds checking.
   * @returns {number} The virtual address, or `0` on failure.
   */
  public resolveFileOffset(offset: number, length?: number): number {
    const sec = this.fileOffsetToSection(offset);
    const len = Math.max(length ?? 0, 1);

    if (sec === null) {
      const rvaEnd = this.nt.optionalHdr.sizeOfHeaders;

      if (offset < rvaEnd && (offset + len) <= rvaEnd) {
        return offset;
      }

      return 0;
    }

    // Apply the boundary check
    const secOffset = offset - sec.ptrRawData;

    if ((secOffset + len) > sec.virtualSize) {
      return 0;
    }

    // Return the final data offset
    return sec.virtualAddress + secOffset;
  }

  /**
   * Validates a raw file offset against the image's raw limit.
   *
   * Returns `0` when `length > 0` and `offset + length` would exceed
   * {@linkcode rawLimit}; otherwise returns `offset` unchanged.
   *
   * @param {number} offset Raw file offset to validate.
   * @param {number} [length] Optional byte span to include in the check.
   * @returns {number} The validated offset, or `0` on failure.
   */
  public resolveRaw(offset: number, length?: number): number {
    const len = Math.max(length ?? 0, 0);

    if (len !== 0 && (offset + len) > this.rawLimit) {
      return 0;
    }

    return offset;
  }

  /**
   * Iterates over every base-relocation entry in the image's `.reloc`
   * directory, yielding a flat sequence of {@linkcode RelocInfo} descriptors.
   *
   * Yields nothing when the base-relocation directory is absent or empty.
   *
   * @returns {IterableIterator<RelocInfo>} Iterator of relocation entries.
   */
  public *getRelocations(): IterableIterator<RelocInfo> {
    const dataDirectory = this.directory(DirectoryEntry.BaseReloc);

    if (dataDirectory !== null) {
      const relocDirOffset = this.resolveRva(dataDirectory.rva);

      if (relocDirOffset > 0) {
        const relocDir = new RelocDirectory(this.data, relocDirOffset);

        for (const { block, entry } of relocDir.walk()) {
          yield {
            baseRva: block.baseRva,
            offset: entry.offset,
            type: entry.type,
          };
        }
      }
    }
  }

  /**
   * Iterates over every entry in the image's export directory, yielding an
   * {@linkcode ExportInfo} descriptor for each function-table slot.
   *
   * Each descriptor carries an optional symbol name and either an RVA (direct
   * export) or a {@linkcode ForwardedExportInfo} (forwarded export).
   * Yields nothing when the export directory is absent or empty.
   *
   * @returns {IterableIterator<ExportInfo>} Iterator of export descriptors.
   */
  public *getExports(): IterableIterator<ExportInfo> {
    const dataDirectory = this.directory(DirectoryEntry.Exports);

    if (dataDirectory !== null) {
      const exportDirOffset = this.resolveRva(dataDirectory.rva);

      if (exportDirOffset > 0) {
        const exportDir = new ExportDirectory(this.data, exportDirOffset);
        const numFunctions = exportDir.numFunctions;
        const numNames = exportDir.numNames;

        if (numFunctions > 0) {
          const delta = exportDirOffset - dataDirectory.rva;
          const dirBegin = delta + dataDirectory.rva;
          const dirEnd = dirBegin + dataDirectory.size;
          const views = this.createExportTableViews(
            exportDir,
            numFunctions,
            numNames,
          );

          for (let i = 0; i < numFunctions; ++i) {
            yield this.parseExportEntry({
              index: i,
              views,
              numNames,
              delta,
              dirBegin,
              dirEnd,
            });
          }
        }
      }
    }
  }

  /**
   * Iterates over every import descriptor in the image's import directory,
   * yielding one {@linkcode ModuleImports} per imported DLL.
   *
   * Each item contains the DLL name and a flat list of its imported functions,
   * each resolved as either a {@linkcode NamedImportInfo} or an
   * {@linkcode OrdinalImportInfo}. Yields nothing when the import directory is
   * absent or empty.
   *
   * @returns {IterableIterator<ModuleImports>} Iterator of per-module import descriptors.
   */
  public *getImports(): IterableIterator<ModuleImports> {
    const dataDirectory = this.directory(DirectoryEntry.Imports);

    if (dataDirectory !== null) {
      const importTableOffset = this.resolveRva(dataDirectory.rva);

      if (importTableOffset > 0) {
        let offset = importTableOffset;
        while (offset + ImportDirectory.SIZE <= this.data.length) {
          const desc = new ImportDirectory(this.data, offset);

          if (desc.isNull()) {
            break;
          }

          const module = this.readImportModuleName(desc);

          if (module !== null) {
            yield {
              module,
              functions: this.collectThunks(desc),
            } satisfies ModuleImports;
          }

          offset += ImportDirectory.SIZE;
        }
      }
    }
  }

  /**
   * Builds three `DataView` windows (names, functions, ordinals) over the
   * export address tables for use during export iteration.
   *
   * @param {ExportDirectory} exportDir The parsed export directory.
   * @param {number} numFunctions Number of entries in the function address table.
   * @param {number} numNames Number of entries in the name and ordinal tables.
   * @returns {ExportTableViews} Views over the three export address tables.
   */
  private createExportTableViews(
    exportDir: ExportDirectory,
    numFunctions: number,
    numNames: number,
  ): ExportTableViews {
    const namesOffset = this.resolveRva(exportDir.rvaNames);
    const functionsOffset = this.resolveRva(exportDir.rvaFunctions);
    const ordinalsOffset = this.resolveRva(exportDir.rvaNameOrdinals);

    return {
      names: new DataView(
        this.data.buffer,
        this.data.byteOffset + namesOffset,
        numNames * 4,
      ),
      functions: new DataView(
        this.data.buffer,
        this.data.byteOffset + functionsOffset,
        numFunctions * 4,
      ),
      ordinals: new DataView(
        this.data.buffer,
        this.data.byteOffset + ordinalsOffset,
        numNames * 2,
      ),
    };
  }

  /**
   * Reads a null-terminated ASCII symbol name from the given RVA.
   *
   * @param {number} nameRva RVA of the null-terminated name string.
   * @returns {string | undefined} The symbol name, or `undefined` if the RVA cannot be resolved.
   */
  private readExportName(nameRva: number): string | undefined {
    const nameOffset = this.resolveRva(nameRva);
    if (nameOffset > 0) {
      return readAsciiUntilNull(
        this.data,
        nameOffset,
        this.data.byteLength - nameOffset,
      );
    }
    return undefined;
  }

  /**
   * Checks whether a function-table entry falls inside the export directory
   * (indicating a forwarded export) and, if so, splits its `"Library.Symbol"`
   * string into a {@linkcode ForwardedExportInfo}-compatible object.
   *
   * @param {number} funcOffset Raw file offset of the function table entry.
   * @param {number} dirBegin Raw file offset of the start of the export directory.
   * @param {number} dirEnd Raw file offset of the end of the export directory.
   * @returns {{ library: string; function: string } | undefined} Parsed forward info, or `undefined` if not a forwarded export.
   */
  private parseForwardedExport(
    funcOffset: number,
    dirBegin: number,
    dirEnd: number,
  ): { library: string; function: string } | undefined {
    if (funcOffset < dirBegin || funcOffset > dirEnd) {
      return undefined;
    }

    const forwardedName = readAsciiUntilNull(
      this.data,
      funcOffset,
      this.data.byteLength - funcOffset,
    );

    const dotPos = forwardedName.indexOf(".");
    if (dotPos === -1) {
      return undefined;
    }

    return {
      library: forwardedName.substring(0, dotPos),
      function: forwardedName.substring(dotPos + 1),
    };
  }

  /**
   * Resolves a single function-table slot into an {@linkcode ExportInfo}
   * descriptor, looking up the symbol name (when available) and determining
   * whether the slot holds a direct RVA or a forwarded export string.
   *
   * @param {ExportEntryDesc} desc Descriptor containing the slot index, pre-built table views, and directory bounds.
   * @returns {ExportInfo} The resolved export entry.
   */
  private parseExportEntry(desc: ExportEntryDesc): ExportInfo {
    const info: ExportInfo = {};

    let ordinal = 0;
    if (desc.index < desc.numNames) {
      ordinal = desc.views.ordinals.getUint16(desc.index * 2, true);
      const nameRva = desc.views.names.getUint32(desc.index * 4, true);
      info.name = this.readExportName(nameRva);
    }

    const funcRva = desc.views.functions.getUint32(ordinal * 4, true);
    const funcOffset = desc.delta + funcRva;

    const forward = this.parseForwardedExport(
      funcOffset,
      desc.dirBegin,
      desc.dirEnd,
    );
    if (forward) {
      info.forward = forward;
    } else {
      info.rva = funcRva;
    }

    return info;
  }

  /**
   * Walks the thunk table of a single import descriptor and returns the
   * collected list of named and ordinal imports for that module.
   *
   * @param {ImportDirectory} desc The import descriptor to process.
   * @returns {(NamedImportInfo | OrdinalImportInfo)[]} Flat list of resolved imports.
   */
  private collectThunks(
    desc: ImportDirectory,
  ): (NamedImportInfo | OrdinalImportInfo)[] {
    const result: (NamedImportInfo | OrdinalImportInfo)[] = [];
    this.parseThunkTable(result, desc);
    return result;
  }

  /**
   * Reads the null-terminated ASCII DLL name from an import descriptor's
   * `rvaName` field.
   *
   * @param {ImportDirectory} desc The import descriptor whose name RVA to resolve.
   * @returns {string | null} The DLL name, or `null` if the RVA cannot be resolved or the name is empty.
   */
  private readImportModuleName(desc: ImportDirectory): string | null {
    const nameOffset = this.resolveRva(desc.rvaName);
    if (nameOffset === 0) {
      return null;
    }

    const name = readAsciiUntilNull(
      this.data,
      nameOffset,
      this.data.byteLength - nameOffset,
    );

    return name.length > 0 ? name : null;
  }

  /**
   * Iterates over every thunk entry in an import descriptor's ILT (or IAT as
   * fallback) and appends resolved {@linkcode NamedImportInfo} or
   * {@linkcode OrdinalImportInfo} items to `cache`.
   *
   * @param {(NamedImportInfo | OrdinalImportInfo)[]} cache Accumulator array to append resolved thunk entries to.
   * @param {ImportDirectory} desc The import descriptor that owns the thunk table.
   */
  private parseThunkTable(
    cache: (NamedImportInfo | OrdinalImportInfo)[],
    desc: ImportDirectory,
  ): void {
    const thunkRva = desc.rvaOriginalFirstThunk !== 0
      ? desc.rvaOriginalFirstThunk
      : desc.rvaFirstThunk;

    const thunkOffset = this.resolveRva(thunkRva);
    if (thunkOffset === 0) {
      return;
    }

    const thunkSize = this.nt.optionalHdr.is64Bit()
      ? ImageThunkData64.SIZE
      : ImageThunkData32.SIZE;

    let offset = thunkOffset;
    let index = 0;

    while (offset + thunkSize <= this.data.length) {
      const thunk = this.createThunk(offset);

      if (thunk.forwarderString === 0n) {
        break;
      }

      this.parseThunk(cache, desc, thunk, index);

      index++;
      offset += thunkSize;
    }
  }

  /**
   * Constructs the appropriate thunk-data wrapper ({@linkcode ImageThunkData64}
   * or {@linkcode ImageThunkData32}) for the current image bitness.
   *
   * @param {number} offset Raw file offset of the thunk entry.
   * @returns {BaseImageThunkData} The parsed thunk entry.
   */
  private createThunk(offset: number): BaseImageThunkData {
    return this.nt.optionalHdr.is64Bit()
      ? new ImageThunkData64(this.data, offset)
      : new ImageThunkData32(this.data, offset);
  }

  /**
   * Resolves a single thunk entry into either a {@linkcode NamedImportInfo}
   * or {@linkcode OrdinalImportInfo} and appends it to `cache`.
   *
   * Named imports are resolved by reading the `IMAGE_IMPORT_BY_NAME` structure
   * at `thunk.addressOfData`; ordinal imports copy the ordinal value directly.
   *
   * @param {(NamedImportInfo | OrdinalImportInfo)[]} cache Accumulator array to append the resolved entry to.
   * @param {ImportDirectory} desc The import descriptor that owns the thunk (used to compute the IAT slot RVA).
   * @param {BaseImageThunkData} thunk The thunk entry to resolve.
   * @param {number} index Zero-based index of this thunk within the table (used to compute the IAT slot RVA).
   */
  private parseThunk(
    cache: (NamedImportInfo | OrdinalImportInfo)[],
    desc: ImportDirectory,
    thunk: BaseImageThunkData,
    index: number,
  ): void {
    const thunkSize = this.nt.optionalHdr.is64Bit()
      ? ImageThunkData64.SIZE
      : ImageThunkData32.SIZE;

    const item = { rva: desc.rvaFirstThunk + index * thunkSize } as
      | NamedImportInfo
      | OrdinalImportInfo;

    if (!thunk.isOrdinal) {
      const nameOffset = this.resolveRva(Number(thunk.addressOfData));

      if (nameOffset > 0) {
        const importByName = new ImageNamedImport(this.data, nameOffset);
        const name = importByName.name;

        if (name.length > 0) {
          (item as NamedImportInfo).name = name;
        }
      }
    } else {
      (item as OrdinalImportInfo).ordinal = thunk.ordinal;
    }

    cache.push(item);
  }
}

/**
 * Loads a PE image from a file path or a raw binary buffer and returns a
 * parsed {@linkcode PeImage} instance.
 *
 * The function validates the DOS (`MZ`) and NT (`PE`) signatures and
 * auto-detects whether the image is 32-bit (PE32) or 64-bit (PE32+).
 *
 * @param {Uint8Array} data Raw PE binary data.
 * @returns {Promise<PeImage>} Parsed PE image.
 * @throws {Error} When the DOS or NT header signature is invalid.
 *
 * @example
 * ```ts
 * // Load from file path
 * const pe = await loadPeImage("C:/Windows/System32/ntdll.dll");
 * console.log("Is 64-bit:", pe.nt.optionalHdr.is64Bit());
 * ```
 */
export function loadPeImage(data: Uint8Array): Promise<PeImage>;
/**
 * Loads a PE image from a file path or a raw binary buffer and returns a
 * parsed {@linkcode PeImage} instance.
 *
 * @param {string} path Path to the PE file on disk.
 * @returns {Promise<PeImage>} Parsed PE image.
 * @throws {Error} When the DOS or NT header signature is invalid.
 *
 * @example
 * ```ts
 * // Load from raw bytes
 * const bytes = await Deno.readFile("image.exe");
 * const pe = await loadPeImage(bytes);
 * ```
 */
export function loadPeImage(path: string): Promise<PeImage>;
export async function loadPeImage(
  dataOrPath: Uint8Array | string,
): Promise<PeImage> {
  if (typeof dataOrPath === "string") {
    return loadPeImage(await Deno.readFile(dataOrPath));
  }

  const dos = new DosHeader(dataOrPath);

  if (!dos.isValid()) {
    throw new Error("Invalid DOS header");
  }

  const nt32 = new NtHeaders32(dataOrPath, dos.nextHdrOffset);

  if (!nt32.isValid()) {
    throw new Error("Invalid NT headers");
  }

  if (nt32.optionalHdr.is32Bit()) {
    return new PeImage(dataOrPath, dos, nt32);
  }

  return new PeImage(
    dataOrPath,
    dos,
    new NtHeaders64(dataOrPath, dos.nextHdrOffset),
  );
}
