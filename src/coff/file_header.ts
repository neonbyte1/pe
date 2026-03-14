import { BaseCharacteristics, BaseFormat } from "../_internal.ts";
import { FILE_HEADER_OFFSETS, FILE_HEADER_SIZE } from "../_offsets.ts";

/** Target machine architecture identifiers stored in the COFF File Header. */
export const enum MachineId {
  Unknown = 0x0000,
  TargetHost = 0x0001,
  i386 = 0x014C, // Intel 386.
  r3000 = 0x0162, // MIPS little-endian, 0x160 big-endian
  r4000 = 0x0166, // MIPS little-endian
  r10000 = 0x0168, // MIPS little-endian
  wcemipsv2 = 0x0169, // MIPS little-endian WCE v2
  Alpha = 0x0184, // Alpha_AXP
  SH3 = 0x01A2, // SH3 little-endian
  SH3DSP = 0x01A3,
  SH3E = 0x01A4, // SH3E little-endian
  SH4 = 0x01A6, // SH4 little-endian
  SH5 = 0x01A8, // SH5
  ARM = 0x01C0, // ARM Little-Endian
  Thumb = 0x01C2, // ARM Thumb/Thumb-2 Little-Endian
  ARM_NT = 0x01C4, // ARM Thumb-2 Little-Endian
  AM33 = 0x01D3,
  PowerPC = 0x01F0, // IBM PowerPC Little-Endian
  PowerPC_FP = 0x01F1,
  ia64 = 0x0200, // Intel 64
  MIPS16 = 0x0266, // MIPS
  Alpha64 = 0x0284, // ALPHA64
  MIPS_FPU = 0x0366, // MIPS
  MIPS_FPU16 = 0x0466, // MIPS
  AXP64 = 0x0284,
  Tricore = 0x0520, // Infineon
  CEF = 0x0CEF,
  EBC = 0x0EBC, // EFI Byte Code
  AMD64 = 0x8664, // AMD64 (K8)
  M32R = 0x9041, // M32R little-endian
  ARM64 = 0xAA64, // ARM64 Little-Endian
  CEE = 0xC0EE,
}

/**
 * Bit positions within the COFF File Header characteristics field.
 * Use with {@linkcode FileCharacteristics} to test or toggle individual flags.
 */
export const enum FileCharacteristicsBits {
  RelocsStripped = 0,
  Executable,
  LinesStripped,
  LocalSymbolsStripped,
  AggressiveWsTrim,
  LargeAddressAware,
  BytesReversedLo = 7,
  Machine32,
  DebugStripped,
  RunnableFromSwap,
  NetRunFromSwap,
  SystemFile,
  DllFile,
  UpSystemOnly,
  BytesReversedHi,
}

/** Typed bitfield wrapper for the COFF File Header characteristics word. */
export class FileCharacteristics
  extends BaseCharacteristics<FileCharacteristicsBits> {
  public static override SIZE: number = 2;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, FileCharacteristics.SIZE);
  }

  /**
   * Raw 16-bit characteristics value.
   *
   * @returns {number} The packed flags word.
   */
  public override get flags(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Sets the raw 16-bit characteristics value.
   *
   * @param {number} value The new packed flags word.
   */
  public override set flags(value: number) {
    this.view.setUint16(0, value, true);
  }

  /**
   * Relocation information was stripped from the file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get hasStrippedRelocs(): boolean {
    return this.isBitSet(FileCharacteristicsBits.RelocsStripped);
  }

  /**
   * Sets whether relocation information was stripped from the file.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set hasStrippedRelocs(active: boolean) {
    this.setBit(FileCharacteristicsBits.RelocsStripped, active);
  }

  /**
   * File is executable (no unresolved external references).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isExecutable(): boolean {
    return this.isBitSet(FileCharacteristicsBits.Executable);
  }

  /**
   * Sets whether the file is executable.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isExecutable(active: boolean) {
    this.setBit(FileCharacteristicsBits.Executable, active);
  }

  /**
   * COFF line-number information was stripped from the file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get hasStrippedLineNumbers(): boolean {
    return this.isBitSet(FileCharacteristicsBits.LinesStripped);
  }

  /**
   * Sets whether COFF line-number information was stripped from the file.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set hasStrippedLineNumbers(active: boolean) {
    this.setBit(FileCharacteristicsBits.LinesStripped, active);
  }

  /**
   * COFF local symbol information was stripped from the file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get hasStrippedLocalSymbols(): boolean {
    return this.isBitSet(FileCharacteristicsBits.LocalSymbolsStripped);
  }

  /**
   * Sets whether COFF local symbol information was stripped from the file.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set hasStrippedLocalSymbols(active: boolean) {
    this.setBit(FileCharacteristicsBits.LocalSymbolsStripped, active);
  }

  /**
   * Aggressively trim the working set (obsolete for Win32).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get aggressiveWsTrim(): boolean {
    return this.isBitSet(FileCharacteristicsBits.AggressiveWsTrim);
  }

  /**
   * Sets whether the loader should aggressively trim the working set.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set aggressiveWsTrim(active: boolean) {
    this.setBit(FileCharacteristicsBits.AggressiveWsTrim, active);
  }

  /**
   * Application can handle addresses larger than 2 GB.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isLargeAddressAware(): boolean {
    return this.isBitSet(FileCharacteristicsBits.LargeAddressAware);
  }

  /**
   * Sets whether the application can handle addresses larger than 2 GB.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isLargeAddressAware(active: boolean) {
    this.setBit(FileCharacteristicsBits.LargeAddressAware, active);
  }

  /**
   * Little-endian byte ordering (obsolete; bytes of the word are reversed).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get bytesReversedLo(): boolean {
    return this.isBitSet(FileCharacteristicsBits.BytesReversedLo);
  }

  /**
   * Sets the obsolete little-endian bytes-reversed flag.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set bytesReversedLo(active: boolean) {
    this.setBit(FileCharacteristicsBits.BytesReversedLo, active);
  }

  /**
   * Machine is based on a 32-bit word architecture.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isMachine32(): boolean {
    return this.isBitSet(FileCharacteristicsBits.Machine32);
  }

  /**
   * Sets whether the machine is based on a 32-bit word architecture.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isMachine32(active: boolean) {
    this.setBit(FileCharacteristicsBits.Machine32, active);
  }

  /**
   * Debug information was stripped and stored separately in a `.dbg` file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get debugStripped(): boolean {
    return this.isBitSet(FileCharacteristicsBits.DebugStripped);
  }

  /**
   * Sets whether debug information was stripped into a separate file.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set debugStripped(active: boolean) {
    this.setBit(FileCharacteristicsBits.DebugStripped, active);
  }

  /**
   * If the image is on removable media, copy and run from the swap file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get runnableFromSwap(): boolean {
    return this.isBitSet(FileCharacteristicsBits.RunnableFromSwap);
  }

  /**
   * Sets whether the image should be copied to and run from the swap file
   * when loaded from removable media.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set runnableFromSwap(active: boolean) {
    this.setBit(FileCharacteristicsBits.RunnableFromSwap, active);
  }

  /**
   * If the image is on a network, copy and run from the swap file.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get netRunFromSwap(): boolean {
    return this.isBitSet(FileCharacteristicsBits.NetRunFromSwap);
  }

  /**
   * Sets whether the image should be copied to and run from the swap file
   * when loaded from a network share.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set netRunFromSwap(active: boolean) {
    this.setBit(FileCharacteristicsBits.NetRunFromSwap, active);
  }

  /**
   * Image is a system file (e.g. a driver) rather than a user program.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isSystemFile(): boolean {
    return this.isBitSet(FileCharacteristicsBits.SystemFile);
  }

  /**
   * Sets whether the image is a system file.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isSystemFile(active: boolean) {
    this.setBit(FileCharacteristicsBits.SystemFile, active);
  }

  /**
   * Image is a DLL.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isDll(): boolean {
    return this.isBitSet(FileCharacteristicsBits.DllFile);
  }

  /**
   * Sets whether the image is a DLL.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isDll(active: boolean) {
    this.setBit(FileCharacteristicsBits.DllFile, active);
  }

  /**
   * File should be run only on a uniprocessor machine.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get isUpSystemOnly(): boolean {
    return this.isBitSet(FileCharacteristicsBits.UpSystemOnly);
  }

  /**
   * Sets whether the file should only run on a uniprocessor machine.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set isUpSystemOnly(active: boolean) {
    this.setBit(FileCharacteristicsBits.UpSystemOnly, active);
  }

  /**
   * Big-endian byte ordering (obsolete; bytes of the word are reversed).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get bytesReversedHi(): boolean {
    return this.isBitSet(FileCharacteristicsBits.BytesReversedHi);
  }

  /**
   * Sets the obsolete big-endian bytes-reversed flag.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set bytesReversedHi(active: boolean) {
    this.setBit(FileCharacteristicsBits.BytesReversedHi, active);
  }
}

/**
 * The COFF File Header (`IMAGE_FILE_HEADER`) that appears immediately after
 * the PE signature in NT headers.
 *
 * Contains machine type, section count, timestamp, and flags that describe
 * the overall characteristics of the image.
 */
export class FileHeader extends BaseFormat {
  public static override SIZE: number = FILE_HEADER_SIZE;

  /** Characteristics flags for this file. */
  public readonly characteristics: FileCharacteristics;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, FileHeader.SIZE);

    this.characteristics = new FileCharacteristics(
      data,
      FileHeader.SIZE - FileCharacteristics.SIZE,
    );
  }

  /**
   * Target machine architecture.
   *
   * @returns {MachineId} The machine identifier.
   */
  public get machine(): MachineId {
    return this.view.getUint16(FILE_HEADER_OFFSETS.machine, true);
  }

  /**
   * Sets the target machine architecture.
   *
   * @param {MachineId} value The target machine identifier.
   */
  public set machine(value: MachineId) {
    this.view.setUint16(FILE_HEADER_OFFSETS.machine, value, true);
  }

  /**
   * Number of section headers that follow the optional header.
   *
   * @returns {number} The section count.
   */
  public get numSections(): number {
    return this.view.getUint16(FILE_HEADER_OFFSETS.numSections, true);
  }

  /**
   * Sets the number of section headers that follow the optional header.
   *
   * @param {number} value The new section count.
   */
  public set numSections(value: number) {
    this.view.setUint16(FILE_HEADER_OFFSETS.numSections, value, true);
  }

  /**
   * Unix timestamp indicating when the file was created by the linker.
   *
   * @returns {number} Seconds since the Unix epoch.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(FILE_HEADER_OFFSETS.timeDateStamp, true);
  }

  /**
   * Sets the linker creation timestamp.
   *
   * @param {number} value Seconds since the Unix epoch.
   */
  public set timeDateStamp(value: number) {
    this.view.setUint32(FILE_HEADER_OFFSETS.timeDateStamp, value, true);
  }

  /**
   * File offset of the COFF symbol table, or zero if none.
   *
   * @returns {number} The byte offset of the symbol table.
   */
  public get ptrToSymbols(): number {
    return this.view.getUint32(FILE_HEADER_OFFSETS.ptrToSymbols, true);
  }

  /**
   * Sets the file offset of the COFF symbol table.
   *
   * @param {number} value The byte offset of the symbol table, or zero.
   */
  public set ptrToSymbols(value: number) {
    this.view.setUint32(FILE_HEADER_OFFSETS.ptrToSymbols, value, true);
  }

  /**
   * Number of entries in the COFF symbol table.
   *
   * @returns {number} The symbol count.
   */
  public get numSymbols(): number {
    return this.view.getUint32(FILE_HEADER_OFFSETS.numSymbols, true);
  }

  /**
   * Sets the number of entries in the COFF symbol table.
   *
   * @param {number} value The new symbol count.
   */
  public set numSymbols(value: number) {
    this.view.setUint32(FILE_HEADER_OFFSETS.numSymbols, value, true);
  }

  /**
   * Byte size of the optional header that follows the file header.
   *
   * @returns {number} The size in bytes.
   */
  public get sizeOptionalHeader(): number {
    return this.view.getUint16(FILE_HEADER_OFFSETS.sizeOptionalHeader, true);
  }

  /**
   * Sets the byte size of the optional header.
   *
   * @param {number} value The new optional header size in bytes.
   */
  public set sizeOptionalHeader(value: number) {
    this.view.setUint32(FILE_HEADER_OFFSETS.sizeOptionalHeader, value, true);
  }
}
