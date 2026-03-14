import {
  BaseCharacteristics,
  BaseFormat,
  LEN_SHORT_STR,
  readAsciiUntilNull,
} from "../_internal.ts";
import { COFF_SECTION_HDR_OFFSETS } from "../_offsets.ts";

/**
 * Bit positions within the COFF section characteristics field.
 * Use with {@linkcode SectionCharacteristics} to test or toggle individual flags.
 */
export const enum SectionCharacteristicsBit {
  ContainsCode = 5,
  ContainsInitData = 6,
  ContainsUninitData = 7,
  LinkInfo = 9,
  LinkRemove = 11,
  LinkComdat = 12,
  NoDeferSpecExc = 14,
  MemFar = 15,
  MemPurgeable = 17,
  MemLocked = 18,
  MemPreload = 19,
  Alignment = 20, // 4 bits
  LinkNRelocOvfl = 24,
  MemDiscardable = 25,
  MemNotCached = 26,
  MemNotPaged = 27,
  MemShared = 28,
  MemExecute = 29,
  MemRead = 30,
  MemWrite = 31,
}

/** Typed bitfield wrapper for the COFF section characteristics dword. */
export class SectionCharacteristics
  extends BaseCharacteristics<SectionCharacteristicsBit> {
  public static override readonly SIZE: number = 4;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, SectionCharacteristics.SIZE);
  }

  /**
   * Raw 32-bit characteristics value.
   *
   * @returns {number} The packed flags dword.
   */
  public override get flags(): number {
    return this.view.getUint32(0, true);
  }

  /**
   * Sets the raw 32-bit characteristics value.
   *
   * @param {number} value The new packed flags dword.
   */
  public override set flags(value: number) {
    this.view.setUint32(0, value, true);
  }

  /**
   * Section contains executable code.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get containsCode(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.ContainsCode);
  }

  /**
   * Sets whether the section contains executable code.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set containsCode(active: boolean) {
    this.setBit(SectionCharacteristicsBit.ContainsCode, active);
  }

  /**
   * Section contains initialized data.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get containsInitData(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.ContainsInitData);
  }

  /**
   * Sets whether the section contains initialized data.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set containsInitData(active: boolean) {
    this.setBit(SectionCharacteristicsBit.ContainsInitData, active);
  }

  /**
   * Section contains uninitialized data (BSS).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get containsUninitData(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.ContainsUninitData);
  }

  /**
   * Sets whether the section contains uninitialized data (BSS).
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set containsUninitData(active: boolean) {
    this.setBit(SectionCharacteristicsBit.ContainsUninitData, active);
  }

  /**
   * Section contains comments or other linker information (object files only).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get linkInfo(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.LinkInfo);
  }

  /**
   * Sets whether the section contains linker information (object files only).
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set linkInfo(active: boolean) {
    this.setBit(SectionCharacteristicsBit.LinkInfo, active);
  }

  /**
   * Section will not become part of the image (object files only).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get linkRemove(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.LinkRemove);
  }

  /**
   * Sets whether the section is excluded from the final image (object files only).
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set linkRemove(active: boolean) {
    this.setBit(SectionCharacteristicsBit.LinkRemove, active);
  }

  /**
   * Section contains COMDAT data (object files only).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get linkComdat(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.LinkComdat);
  }

  /**
   * Sets whether the section contains COMDAT data (object files only).
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set linkComdat(active: boolean) {
    this.setBit(SectionCharacteristicsBit.LinkComdat, active);
  }

  /**
   * Reset speculative exception-handling bits in the TLB entries for this section.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get noDeferSpecExc(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.NoDeferSpecExc);
  }

  /**
   * Sets whether speculative exception-handling bits in TLB entries are reset
   * for this section.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set noDeferSpecExc(active: boolean) {
    this.setBit(SectionCharacteristicsBit.NoDeferSpecExc, active);
  }

  /**
   * Obsolete far-memory flag.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memFar(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemFar);
  }

  /**
   * Sets the obsolete far-memory flag.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memFar(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemFar, active);
  }

  /**
   * Section can be purged from memory.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memPurgeable(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemPurgeable);
  }

  /**
   * Sets whether the section can be purged from memory.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memPurgeable(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemPurgeable, active);
  }

  /**
   * Section must be locked into memory while data is accessed.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memLocked(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemLocked);
  }

  /**
   * Sets whether the section must be locked into memory while data is accessed.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memLocked(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemLocked, active);
  }

  /**
   * Section should be preloaded into memory before execution.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memPreload(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemPreload);
  }

  /**
   * Sets whether the section should be preloaded into memory before execution.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memPreload(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemPreload, active);
  }

  /**
   * Raw 4-bit alignment encoding stored in the characteristics field.
   * Use {@linkcode alignment} for the decoded byte value.
   *
   * @returns {number} The 4-bit alignment nibble.
   */
  public get alignmentBits(): number {
    return (this.flags >> SectionCharacteristicsBit.Alignment) & 0b1111;
  }

  /**
   * Sets the raw 4-bit alignment encoding in the characteristics field.
   *
   * @param {number} value The raw 4-bit alignment nibble to encode.
   */
  public set alignmentBits(value: number) {
    const mask = 0b1111 << SectionCharacteristicsBit.Alignment;
    this.flags = (this.flags & ~mask) |
      ((value & 0b1111) << SectionCharacteristicsBit.Alignment);
  }

  /**
   * Section alignment in bytes, decoded from {@linkcode alignmentBits}.
   * Valid values are powers of two from 1 to 8192, or 16 (encoded as 0).
   *
   * @returns {number} The alignment in bytes.
   */
  public get alignment(): number {
    const n = this.alignmentBits;
    return n ? 1 << (n - 1) : 16;
  }

  /**
   * Sets the section alignment, encoding it into the characteristics field.
   *
   * @param {number} value Alignment in bytes; must be a power of two or `16`.
   */
  public set alignment(value: number) {
    let n: number;

    if (value === 16) {
      n = 0;
    } else {
      const log2 = Math.log2(value);
      if (!Number.isInteger(log2) || value < 1) {
        throw new Error("Alignment must be a power of two (or 16).");
      }

      n = log2 + 1;
    }

    if (n < 0 || n > 0b1111) {
      throw new Error("Alignment value out of range.");
    }

    const shift = SectionCharacteristicsBit.Alignment;
    const mask = 0b1111 << shift;

    this.flags = (this.flags & ~mask) | ((n & 0b1111) << shift);
  }

  /**
   * Section contains extended relocations whose count overflows the 16-bit field.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get linkNRelocOvfl(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.LinkNRelocOvfl);
  }

  /**
   * Sets whether the section's relocation count overflows the 16-bit field.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set linkNRelocOvfl(active: boolean) {
    this.setBit(SectionCharacteristicsBit.LinkNRelocOvfl, active);
  }

  /**
   * Section can be discarded as needed (e.g. `.reloc` after image load).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memDiscardable(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemDiscardable);
  }

  /**
   * Sets whether the section can be discarded after image loading.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memDiscardable(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemDiscardable, active);
  }

  /**
   * Section cannot be cached.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memNotCached(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemNotCached);
  }

  /**
   * Sets whether the section cannot be cached.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memNotCached(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemNotCached, active);
  }

  /**
   * Section is not pageable.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memNotPaged(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemNotPaged);
  }

  /**
   * Sets whether the section is not pageable.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memNotPaged(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemNotPaged, active);
  }

  /**
   * Section can be shared in memory.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memShared(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemShared);
  }

  /**
   * Sets whether the section can be shared in memory.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memShared(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemShared, active);
  }

  /**
   * Section can be executed as code.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memExecute(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemExecute);
  }

  /**
   * Sets whether the section can be executed as code.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memExecute(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemExecute, active);
  }

  /**
   * Section can be read.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memRead(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemRead);
  }

  /**
   * Sets whether the section can be read.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memRead(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemRead, active);
  }

  /**
   * Section can be written to.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get memWrite(): boolean {
    return this.isBitSet(SectionCharacteristicsBit.MemWrite);
  }

  /**
   * Sets whether the section can be written to.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set memWrite(active: boolean) {
    this.setBit(SectionCharacteristicsBit.MemWrite, active);
  }
}

/**
 * A single COFF/PE section header (`IMAGE_SECTION_HEADER`) describing the
 * name, virtual address, raw-data location, and memory attributes of one
 * section.
 */
export class SectionHeader extends BaseFormat {
  public static override readonly SIZE: number = 40;

  /** Memory-protection and content flags for this section. */
  public readonly characteristics: SectionCharacteristics;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, SectionHeader.SIZE);

    this.characteristics = new SectionCharacteristics(
      data,
      offset + COFF_SECTION_HDR_OFFSETS.characteristics,
    );
  }

  /**
   * Null-terminated 8-byte ASCII name of the section (e.g. `.text`, `.data`).
   *
   * @returns {string} The section name.
   */
  public get name(): string {
    return readAsciiUntilNull(
      this.view,
      COFF_SECTION_HDR_OFFSETS.name,
      LEN_SHORT_STR,
    );
  }

  /**
   * For object files, the virtual size or physical address of the section.
   * For images this field is the virtual size before alignment padding.
   *
   * @returns {number} The physical address or unpadded virtual size.
   */
  public get physicalAddress(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.physicalAddress, true);
  }

  /**
   * Sets the physical address or virtual size field.
   *
   * @param {number} value The new physical address or virtual size.
   */
  public set physicalAddress(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.physicalAddress, value, true);
  }

  /**
   * Actual byte count of section data when loaded into memory (before
   * alignment padding to {@linkcode sizeRawData}).
   *
   * @returns {number} The virtual size in bytes.
   */
  public get virtualSize(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.virtualSize, true);
  }

  /**
   * Sets the virtual size of the section in memory.
   *
   * @param {number} value The new virtual size in bytes.
   */
  public set virtualSize(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.virtualSize, value, true);
  }

  /**
   * RVA of the first byte of the section when loaded into memory.
   *
   * @returns {number} The virtual address (RVA).
   */
  public get virtualAddress(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.virtualAddress, true);
  }

  /**
   * Sets the RVA of the section when loaded into memory.
   *
   * @param {number} value The new virtual address (RVA).
   */
  public set virtualAddress(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.virtualAddress, value, true);
  }

  /**
   * Byte size of the section's raw data on disk, rounded up to
   * {@linkcode BaseOptionalHeader.fileAlignment}.
   *
   * @returns {number} The raw-data size in bytes.
   */
  public get sizeRawData(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.sizeRawData, true);
  }

  /**
   * Sets the on-disk byte size of the section's raw data.
   *
   * @param {number} value The new raw-data size in bytes.
   */
  public set sizeRawData(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.sizeRawData, value, true);
  }

  /**
   * File offset of the section's raw data. Zero for sections with no raw data
   * (e.g. BSS).
   *
   * @returns {number} The byte offset within the file.
   */
  public get ptrRawData(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.ptrRawData, true);
  }

  /**
   * Sets the file offset of the section's raw data.
   *
   * @param {number} value The new file offset of the raw data.
   */
  public set ptrRawData(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.ptrRawData, value, true);
  }

  /**
   * File offset of the section's COFF relocations. Zero for PE images
   * (relocations are in the `.reloc` directory instead).
   *
   * @returns {number} The byte offset of the relocation table.
   */
  public get ptrRelocs(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.ptrRelocs, true);
  }

  /**
   * Sets the file offset of the section's COFF relocation table.
   *
   * @param {number} value The new file offset of the relocation table.
   */
  public set ptrRelocs(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.ptrRelocs, value, true);
  }

  /**
   * File offset of the COFF line-number entries for this section (deprecated).
   *
   * @returns {number} The byte offset of the line-number table.
   */
  public get ptrLineNumbers(): number {
    return this.view.getUint32(COFF_SECTION_HDR_OFFSETS.ptrLineNumbers, true);
  }

  /**
   * Sets the file offset of the COFF line-number table (deprecated).
   *
   * @param {number} value The new file offset of the line-number table.
   */
  public set ptrLineNumbers(value: number) {
    this.view.setUint32(COFF_SECTION_HDR_OFFSETS.ptrLineNumbers, value, true);
  }

  /**
   * Number of COFF relocation entries for this section.
   *
   * @returns {number} The relocation count.
   */
  public get numRelocs(): number {
    return this.view.getUint16(COFF_SECTION_HDR_OFFSETS.numRelocs, true);
  }

  /**
   * Sets the number of COFF relocation entries for this section.
   *
   * @param {number} value The new relocation count.
   */
  public set numRelocs(value: number) {
    this.view.setUint16(COFF_SECTION_HDR_OFFSETS.numRelocs, value, true);
  }

  /**
   * Number of COFF line-number entries for this section (deprecated).
   *
   * @returns {number} The line-number count.
   */
  public get numLineNumbers(): number {
    return this.view.getUint16(COFF_SECTION_HDR_OFFSETS.numLineNumbers, true);
  }

  /**
   * Sets the number of COFF line-number entries for this section (deprecated).
   *
   * @param {number} value The new line-number count.
   */
  public set numLineNumbers(value: number) {
    this.view.setUint16(COFF_SECTION_HDR_OFFSETS.numLineNumbers, value, true);
  }

  /**
   * Returns `true` when this section is likely to be demand-paged. A section
   * is considered paged if the `MemNotPaged` flag is clear and the section
   * name starts with `".eda"` or is `"PAGE"`.
   *
   * @returns {boolean} `true` if the section is pageable.
   */
  public paged(): boolean {
    const nameValue = this.view.getUint32(0, true);
    const memNotPaged = (this.characteristics.flags & 0x08000000) !== 0;

    return (
      !memNotPaged &&
      (nameValue === 0x6164652e || // ".eda"
        nameValue === 0x45474150) // "PAGE"
    );
  }

  /**
   * Returns `true` when this section is discardable after image loading.
   * A section is discardable if the `MemDiscardable` flag is set or the
   * section name is `"INIT"`.
   *
   * @returns {boolean} `true` if the section is discardable.
   */
  public discardable(): boolean {
    const nameValue = this.view.getUint32(0, true);
    const memDiscardable = (this.characteristics.flags & 0x02000000) !== 0;

    return memDiscardable || nameValue === 0x54494e49; // "INIT"
  }

  /**
   * Returns `true` when the given RVA falls within this section's virtual
   * address range `[virtualAddress, virtualAddress + virtualSize)`.
   *
   * @param {number} rva The relative virtual address to test.
   * @returns {boolean} `true` if `rva` is inside this section.
   */
  public isRvaInside(rva: number): boolean {
    return (
      this.virtualAddress <= rva &&
      rva < this.virtualAddress + this.virtualSize
    );
  }

  /**
   * Returns `true` when the given file offset falls within this section's
   * raw-data range `[ptrRawData, ptrRawData + sizeRawData)`.
   *
   * @param {number} offset The file offset to test.
   * @returns {boolean} `true` if `offset` is inside this section's raw data.
   */
  public isFileOffsetInside(offset: number): boolean {
    return (
      this.ptrRawData <= offset &&
      offset < this.ptrRawData + this.sizeRawData
    );
  }
}
