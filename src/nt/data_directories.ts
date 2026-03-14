import { DataDirectory } from "./data_directory.ts";

/**
 * Indices into the PE Optional Header data-directory array.
 *
 * Pass a value from this enum to {@linkcode PeImage.directory} to retrieve
 * the corresponding {@linkcode DataDirectory} entry.
 */
export const enum DirectoryEntry {
  Exports = 0,
  Imports,
  Resource,
  Exception,
  Security,
  BaseReloc,
  Debug,
  Copyright,
  Architecture = 7,
  GlobalPtr,
  TLS,
  LoadConfig,
  BoundImport,
  IAT,
  DelayImport,
  ComDescriptor,
  Reserved,
}

/**
 * The array of sixteen {@linkcode DataDirectory} entries stored at the end of
 * the PE Optional Header. Each entry is also accessible by name via a
 * dedicated property (e.g. {@linkcode exports}, {@linkcode imports}).
 */
export class DataDirectories {
  public static readonly SIZE: number = DataDirectory.SIZE *
    (DirectoryEntry.Reserved + 1);

  /** All sixteen directory entries in index order. */
  public readonly entries: DataDirectory[] = [];

  /**
   * Parses all sixteen data-directory entries from the given buffer.
   *
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where the array begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    for (let i = 0; i <= DirectoryEntry.Reserved; ++i) {
      this.entries.push(
        new DataDirectory(data, offset + (i * DataDirectory.SIZE)),
      );
    }
  }

  /**
   * Export directory entry (`IMAGE_DIRECTORY_ENTRY_EXPORT`).
   *
   * @returns {DataDirectory} The export directory entry.
   */
  public get exports(): DataDirectory {
    return this.entries[DirectoryEntry.Exports];
  }

  /**
   * Import directory entry (`IMAGE_DIRECTORY_ENTRY_IMPORT`).
   *
   * @returns {DataDirectory} The import directory entry.
   */
  public get imports(): DataDirectory {
    return this.entries[DirectoryEntry.Imports];
  }

  /**
   * Resource directory entry (`IMAGE_DIRECTORY_ENTRY_RESOURCE`).
   *
   * @returns {DataDirectory} The resource directory entry.
   */
  public get resources(): DataDirectory {
    return this.entries[DirectoryEntry.Resource];
  }

  /**
   * Exception directory entry (`IMAGE_DIRECTORY_ENTRY_EXCEPTION`).
   *
   * @returns {DataDirectory} The exception directory entry.
   */
  public get exceptions(): DataDirectory {
    return this.entries[DirectoryEntry.Exception];
  }

  /**
   * Security (attribute certificate table) directory entry
   * (`IMAGE_DIRECTORY_ENTRY_SECURITY`).
   *
   * @returns {DataDirectory} The security directory entry.
   */
  public get security(): DataDirectory {
    return this.entries[DirectoryEntry.Security];
  }

  /**
   * Base relocation directory entry (`IMAGE_DIRECTORY_ENTRY_BASERELOC`).
   *
   * @returns {DataDirectory} The base relocation directory entry.
   */
  public get baseReloc(): DataDirectory {
    return this.entries[DirectoryEntry.BaseReloc];
  }

  /**
   * Debug directory entry (`IMAGE_DIRECTORY_ENTRY_DEBUG`).
   *
   * @returns {DataDirectory} The debug directory entry.
   */
  public get debug(): DataDirectory {
    return this.entries[DirectoryEntry.Debug];
  }

  /**
   * Architecture-specific data directory entry
   * (`IMAGE_DIRECTORY_ENTRY_COPYRIGHT` / `IMAGE_DIRECTORY_ENTRY_ARCHITECTURE`).
   *
   * @returns {DataDirectory} The copyright/architecture directory entry.
   */
  public get copyright(): DataDirectory {
    return this.entries[DirectoryEntry.Copyright];
  }

  /**
   * Architecture directory entry (`IMAGE_DIRECTORY_ENTRY_ARCHITECTURE`).
   *
   * @returns {DataDirectory} The architecture directory entry.
   */
  public get architecture(): DataDirectory {
    return this.entries[DirectoryEntry.Architecture];
  }

  /**
   * Global pointer directory entry (`IMAGE_DIRECTORY_ENTRY_GLOBALPTR`).
   *
   * @returns {DataDirectory} The global pointer directory entry.
   */
  public get globalPtr(): DataDirectory {
    return this.entries[DirectoryEntry.GlobalPtr];
  }

  /**
   * Thread-local storage directory entry (`IMAGE_DIRECTORY_ENTRY_TLS`).
   *
   * @returns {DataDirectory} The TLS directory entry.
   */
  public get tls(): DataDirectory {
    return this.entries[DirectoryEntry.TLS];
  }

  /**
   * Load configuration directory entry (`IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG`).
   *
   * @returns {DataDirectory} The load configuration directory entry.
   */
  public get loadConfig(): DataDirectory {
    return this.entries[DirectoryEntry.LoadConfig];
  }

  /**
   * Bound import directory entry (`IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT`).
   *
   * @returns {DataDirectory} The bound import directory entry.
   */
  public get boundImport(): DataDirectory {
    return this.entries[DirectoryEntry.BoundImport];
  }

  /**
   * Import address table directory entry (`IMAGE_DIRECTORY_ENTRY_IAT`).
   *
   * @returns {DataDirectory} The IAT directory entry.
   */
  public get iat(): DataDirectory {
    return this.entries[DirectoryEntry.IAT];
  }

  /**
   * Delay-load import directory entry (`IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT`).
   *
   * @returns {DataDirectory} The delay-load import directory entry.
   */
  public get delayImport(): DataDirectory {
    return this.entries[DirectoryEntry.DelayImport];
  }

  /**
   * COM+ / CLR runtime descriptor directory entry
   * (`IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR`).
   *
   * @returns {DataDirectory} The COM descriptor directory entry.
   */
  public get comDescriptor(): DataDirectory {
    return this.entries[DirectoryEntry.ComDescriptor];
  }
}
