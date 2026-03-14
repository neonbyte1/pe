import { BaseCharacteristics, bigIntToInt } from "../_internal.ts";
import {
  BASE_OPTIONAL_HDR_OFFSETS,
  OPTIONAL_HDR32_OFFSETS,
  OPTIONAL_HDR64_OFFSETS,
} from "../_offsets.ts";
import { CoffOptionalHeader } from "../coff/optional_header.ts";
import { Version32 } from "../coff/version.ts";
import { DataDirectories } from "./data_directories.ts";

/**
 * Bit positions within the DLL Characteristics field of the Optional Header.
 * Use with {@linkcode DllCharacteristics} to test or toggle individual flags.
 */
export const enum DllCharacteristicsBits {
  HighEntropyVa = 5,
  DynamicBase,
  ForceIntegrity,
  NxCompat,
  NoIsolation,
  NoSEH,
  NoBind,
  Appcontainer,
  WdmDriver,
  GuardCf,
  TerminalServerAware,
}

/** Typed bitfield wrapper for the Optional Header's DLL Characteristics word. */
export class DllCharacteristics
  extends BaseCharacteristics<DllCharacteristicsBits> {
  public static override readonly SIZE: number = 2;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, DllCharacteristics.SIZE);
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
   * Image can handle a high-entropy 64-bit virtual address space (ASLR).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get highEntropyVa(): boolean {
    return this.isBitSet(DllCharacteristicsBits.HighEntropyVa);
  }

  /**
   * Sets whether the image can handle a high-entropy 64-bit virtual address space.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set highEntropyVa(active: boolean) {
    this.setBit(DllCharacteristicsBits.HighEntropyVa, active);
  }

  /**
   * Image can be relocated at load time (ASLR).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get dynamicBase(): boolean {
    return this.isBitSet(DllCharacteristicsBits.DynamicBase);
  }

  /**
   * Sets whether the image can be relocated at load time.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set dynamicBase(active: boolean) {
    this.setBit(DllCharacteristicsBits.DynamicBase, active);
  }

  /**
   * Code integrity checks are enforced.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get forceIntegrity(): boolean {
    return this.isBitSet(DllCharacteristicsBits.ForceIntegrity);
  }

  /**
   * Sets whether code integrity checks are enforced.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set forceIntegrity(active: boolean) {
    this.setBit(DllCharacteristicsBits.ForceIntegrity, active);
  }

  /**
   * Image is compatible with data execution prevention (NX/DEP).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get nxCompat(): boolean {
    return this.isBitSet(DllCharacteristicsBits.NxCompat);
  }

  /**
   * Sets whether the image is compatible with data execution prevention.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set nxCompat(active: boolean) {
    this.setBit(DllCharacteristicsBits.NxCompat, active);
  }

  /**
   * Image is isolation-aware but should not be isolated.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get noIsolation(): boolean {
    return this.isBitSet(DllCharacteristicsBits.NoIsolation);
  }

  /**
   * Sets whether the image should not be isolated.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set noIsolation(active: boolean) {
    this.setBit(DllCharacteristicsBits.NoIsolation, active);
  }

  /**
   * Image does not use structured exception handling (SEH).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get noSeh(): boolean {
    return this.isBitSet(DllCharacteristicsBits.NoSEH);
  }

  /**
   * Sets whether the image does not use structured exception handling.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set noSeh(active: boolean) {
    this.setBit(DllCharacteristicsBits.NoSEH, active);
  }

  /**
   * Do not bind this image.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get noBind(): boolean {
    return this.isBitSet(DllCharacteristicsBits.NoBind);
  }

  /**
   * Sets whether this image should not be bound.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set noBind(active: boolean) {
    this.setBit(DllCharacteristicsBits.NoBind, active);
  }

  /**
   * Image must run inside an AppContainer.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get appcontainer(): boolean {
    return this.isBitSet(DllCharacteristicsBits.Appcontainer);
  }

  /**
   * Sets whether the image must run inside an AppContainer.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set appcontainer(active: boolean) {
    this.setBit(DllCharacteristicsBits.Appcontainer, active);
  }

  /**
   * Image is a WDM driver.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get wdmDriver(): boolean {
    return this.isBitSet(DllCharacteristicsBits.WdmDriver);
  }

  /**
   * Sets whether the image is a WDM driver.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set wdmDriver(active: boolean) {
    this.setBit(DllCharacteristicsBits.WdmDriver, active);
  }

  /**
   * Image supports Control Flow Guard.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get guardCf(): boolean {
    return this.isBitSet(DllCharacteristicsBits.GuardCf);
  }

  /**
   * Sets whether the image supports Control Flow Guard.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set guardCf(active: boolean) {
    this.setBit(DllCharacteristicsBits.GuardCf, active);
  }

  /**
   * Image is Terminal Server aware.
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get terminalServerAware(): boolean {
    return this.isBitSet(DllCharacteristicsBits.TerminalServerAware);
  }

  /**
   * Sets whether the image is Terminal Server aware.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set terminalServerAware(active: boolean) {
    this.setBit(DllCharacteristicsBits.TerminalServerAware, active);
  }
}

/** Windows subsystem required to run the image, as stored in the Optional Header. */
export const enum SubSystem {
  Unknown = 0x0000, // Unknown subsystem.
  Native = 0x0001, // Image doesn't require a subsystem.
  WindowsGui = 0x0002, // Image runs in the Windows GUI subsystem.
  WindowsCui = 0x0003, // Image runs in the Windows character subsystem
  Os2Cui = 0x0005, // image runs in the OS/2 character subsystem.
  PosixCui = 0x0007, // image runs in the Posix character subsystem.
  NativeWindows = 0x0008, // image is a native Win9x driver.
  WindowsCeGui = 0x0009, // Image runs in the Windows CE subsystem.
  EfiApplication = 0x000A, //
  EfiBootServiceDriver = 0x000B, //
  EfiRuntimeDriver = 0x000C, //
  EfiRom = 0x000D,
  Xbox = 0x000E,
  WindowsBootApplication = 0x0010,
  XboxCodeCatalog = 0x0011,
}

/**
 * Abstract base for the PE Optional Header, shared between the 32-bit
 * ({@linkcode OptionalHeader32}) and 64-bit ({@linkcode OptionalHeader64}) variants.
 *
 * Extends {@linkcode CoffOptionalHeader} with Windows-specific fields such as
 * image base, section/file alignment, subsystem, and data directories.
 */
export abstract class BaseOptionalHeader extends CoffOptionalHeader {
  /** Minimum OS version required to run this image. */
  public readonly osVersion: Version32;

  /** Version of this image as stamped by the linker. */
  public readonly imgVersion: Version32;

  /** Minimum subsystem version required to run this image. */
  public readonly subsystemVersion: Version32;

  /** DLL characteristics flags for this image. */
  public readonly characteristics: DllCharacteristics;

  /** The sixteen data-directory entries embedded at the end of this header. */
  public readonly directories: DataDirectories;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   * @param {number} size Total byte size of the concrete header variant.
   */
  protected constructor(
    data: Uint8Array,
    offset: number,
    size: number,
  ) {
    super(data, offset, size);

    const endOfCoffOptHeader = offset + CoffOptionalHeader.SIZE;

    this.osVersion = new Version32(
      data,
      endOfCoffOptHeader + BASE_OPTIONAL_HDR_OFFSETS.osVersion,
    );
    this.imgVersion = new Version32(
      data,
      endOfCoffOptHeader + BASE_OPTIONAL_HDR_OFFSETS.imgVersion,
    );
    this.subsystemVersion = new Version32(
      data,
      endOfCoffOptHeader + BASE_OPTIONAL_HDR_OFFSETS.subsystemVersion,
    );
    this.characteristics = new DllCharacteristics(
      data,
      endOfCoffOptHeader + BASE_OPTIONAL_HDR_OFFSETS.characteristics,
    );

    this.directories = new DataDirectories(
      data,
      offset + (size - DataDirectories.SIZE),
    );
  }

  /**
   * RVA of the beginning of the initialized-data section (PE32 only).
   * Always `undefined` in PE32+ images.
   *
   * @returns {number | undefined} The RVA, or `undefined` for 64-bit images.
   */
  public abstract get baseOfData(): number | undefined;

  /**
   * Sets the RVA of the beginning of the initialized-data section.
   *
   * @param {number} value The new base-of-data RVA.
   */
  public abstract set baseOfData(value: number);

  /**
   * Preferred load address of the image in memory.
   * 64-bit in PE32+, widened from a 32-bit field in PE32.
   *
   * @returns {bigint} The image base address.
   */
  public abstract get imageBase(): bigint;

  /**
   * Sets the preferred load address of the image in memory.
   *
   * @param {bigint | number} value The new image base address.
   */
  public abstract set imageBase(value: bigint | number);

  /**
   * Alignment (in bytes) of sections in memory. Must be >= {@linkcode fileAlignment}.
   *
   * @returns {number} The section alignment value.
   */
  public get sectionAlignment(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sectionAlignment,
      true,
    );
  }

  /**
   * Sets the alignment of sections in memory.
   *
   * @param {number} value The new section alignment value in bytes.
   */
  public set sectionAlignment(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sectionAlignment,
      value,
      true,
    );
  }

  /**
   * Alignment (in bytes) of raw section data in the file. Must be a power of
   * two between 512 and 64 KB, inclusive.
   *
   * @returns {number} The file alignment value.
   */
  public get fileAlignment(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.fileAlignment,
      true,
    );
  }

  /**
   * Sets the alignment of raw section data in the file.
   *
   * @param {number} value The new file alignment value in bytes.
   */
  public set fileAlignment(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.fileAlignment,
      value,
      true,
    );
  }

  /**
   * Reserved; must be zero.
   *
   * @returns {number} The win32 version value.
   */
  public get win32VersionValue(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.win32VersionValue,
      true,
    );
  }

  /**
   * Sets the reserved win32 version value; must be zero.
   *
   * @param {number} value The new win32 version value.
   */
  public set win32VersionValue(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.win32VersionValue,
      value,
      true,
    );
  }

  /**
   * Total byte size of the image (including all headers) as it is loaded into
   * memory. Must be a multiple of {@linkcode sectionAlignment}.
   *
   * @returns {number} The size of the image in bytes.
   */
  public get sizeOfImage(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sizeOfImage,
      true,
    );
  }

  /**
   * Sets the total byte size of the image as loaded into memory.
   *
   * @param {number} value The new image size in bytes.
   */
  public set sizeOfImage(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sizeOfImage,
      value,
      true,
    );
  }

  /**
   * Combined byte size of all headers rounded up to a multiple of
   * {@linkcode fileAlignment}.
   *
   * @returns {number} The size of the headers in bytes.
   */
  public get sizeOfHeaders(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sizeOfHeaders,
      true,
    );
  }

  /**
   * Sets the combined byte size of all headers.
   *
   * @param {number} value The new headers size in bytes.
   */
  public set sizeOfHeaders(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.sizeOfHeaders,
      value,
      true,
    );
  }

  /**
   * CRC32 checksum of the image file; checked by the loader for kernel-mode
   * drivers and some system DLLs.
   *
   * @returns {number} The 32-bit checksum.
   */
  public get checksum(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.checksum,
      true,
    );
  }

  /**
   * Sets the CRC32 checksum of the image file.
   *
   * @param {number} value The new 32-bit checksum.
   */
  public set checksum(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.checksum,
      value,
      true,
    );
  }

  /**
   * Windows subsystem required to run this image.
   *
   * @returns {SubSystem} The subsystem identifier.
   */
  public get subsystem(): SubSystem {
    return this.view.getUint16(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.subsystem,
      true,
    );
  }

  /**
   * Sets the Windows subsystem required to run this image.
   *
   * @param {SubSystem} value The new subsystem identifier.
   */
  public set subsystem(value: SubSystem) {
    this.view.setUint16(
      CoffOptionalHeader.SIZE + BASE_OPTIONAL_HDR_OFFSETS.subsystem,
      value,
      true,
    );
  }

  /**
   * Number of bytes to reserve for the stack.
   *
   * @returns {bigint} The stack reserve size.
   */
  public abstract get sizeOfStackReserve(): bigint;

  /**
   * Sets the number of bytes to reserve for the stack.
   *
   * @param {bigint | number} value The new stack reserve size in bytes.
   */
  public abstract set sizeOfStackReserve(value: bigint | number);

  /**
   * Number of bytes to commit for the initial stack.
   *
   * @returns {bigint} The stack commit size.
   */
  public abstract get sizeOfStackCommit(): bigint;

  /**
   * Sets the number of bytes to commit for the initial stack.
   *
   * @param {bigint | number} value The new stack commit size in bytes.
   */
  public abstract set sizeOfStackCommit(value: bigint | number);

  /**
   * Number of bytes to reserve for the local heap.
   *
   * @returns {bigint} The heap reserve size.
   */
  public abstract get sizeOfHeapReserve(): bigint;

  /**
   * Sets the number of bytes to reserve for the local heap.
   *
   * @param {bigint | number} value The new heap reserve size in bytes.
   */
  public abstract set sizeOfHeapReserve(value: bigint | number);

  /**
   * Number of bytes to commit for the initial local heap.
   *
   * @returns {bigint} The heap commit size.
   */
  public abstract get sizeOfHeapCommit(): bigint;

  /**
   * Sets the number of bytes to commit for the initial local heap.
   *
   * @param {bigint | number} value The new heap commit size in bytes.
   */
  public abstract set sizeOfHeapCommit(value: bigint | number);

  /**
   * Obsolete loader flags; must be zero.
   *
   * @returns {number} The loader flags value.
   */
  public abstract get ldrFlags(): number;

  /**
   * Sets the obsolete loader flags value; must be zero.
   *
   * @param {number} value The new loader flags value.
   */
  public abstract set ldrFlags(value: number);

  /**
   * Number of data-directory entries present in the optional header.
   *
   * @returns {number} The count of data-directory entries.
   */
  public abstract get numDataDirectories(): number;

  /**
   * Sets the number of data-directory entries present in the optional header.
   *
   * @param {number} value The new data-directory entry count.
   */
  public abstract set numDataDirectories(value: number);
}

/**
 * Optional Header for 64-bit (PE32+) images. Image base and stack/heap
 * fields are 64-bit; {@linkcode baseOfData} is not present and always returns `0`.
 */
export class OptionalHeader64 extends BaseOptionalHeader {
  public static override readonly SIZE: number = 0xF0;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, OptionalHeader64.SIZE);
  }

  /**
   * Not present in PE32+ images; always returns `0`.
   *
   * @returns {number} Always `0`.
   */
  public get baseOfData(): number | number {
    return 0;
  }

  /**
   * Sets the base-of-data field; no-op in PE32+ images.
   *
   * @param {number} _ Ignored.
   */
  public set baseOfData(_: number) {}

  /**
   * Preferred 64-bit load address of the image.
   *
   * @returns {bigint} The image base address.
   */
  public get imageBase(): bigint {
    return this.view.getBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.imageBase,
      true,
    );
  }

  /**
   * Sets the preferred 64-bit load address of the image.
   *
   * @param {bigint | number} value The new image base address.
   */
  public set imageBase(value: bigint | number) {
    this.view.setBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.imageBase,
      BigInt(value),
      true,
    );
  }

  /**
   * Number of bytes to reserve for the stack (64-bit field).
   *
   * @returns {bigint} The stack reserve size.
   */
  public get sizeOfStackReserve(): bigint {
    return this.view.getBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfStackReserve,
      true,
    );
  }

  /**
   * Sets the number of bytes to reserve for the stack.
   *
   * @param {bigint | number} value The new stack reserve size in bytes.
   */
  public set sizeOfStackReserve(value: bigint | number) {
    this.view.setBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfStackReserve,
      BigInt(value),
      true,
    );
  }

  /**
   * Number of bytes to commit for the initial stack (64-bit field).
   *
   * @returns {bigint} The stack commit size.
   */
  public get sizeOfStackCommit(): bigint {
    return this.view.getBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfStackCommit,
      true,
    );
  }

  /**
   * Sets the number of bytes to commit for the initial stack.
   *
   * @param {bigint | number} value The new stack commit size in bytes.
   */
  public set sizeOfStackCommit(value: bigint | number) {
    this.view.setBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfStackCommit,
      BigInt(value),
      true,
    );
  }

  /**
   * Number of bytes to reserve for the local heap (64-bit field).
   *
   * @returns {bigint} The heap reserve size.
   */
  public get sizeOfHeapReserve(): bigint {
    return this.view.getBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfHeapReserve,
      true,
    );
  }

  /**
   * Sets the number of bytes to reserve for the local heap.
   *
   * @param {bigint | number} value The new heap reserve size in bytes.
   */
  public set sizeOfHeapReserve(value: bigint | number) {
    this.view.setBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfHeapReserve,
      BigInt(value),
      true,
    );
  }

  /**
   * Number of bytes to commit for the initial local heap (64-bit field).
   *
   * @returns {bigint} The heap commit size.
   */
  public get sizeOfHeapCommit(): bigint {
    return this.view.getBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfHeapCommit,
      true,
    );
  }

  /**
   * Sets the number of bytes to commit for the initial local heap.
   *
   * @param {bigint | number} value The new heap commit size in bytes.
   */
  public set sizeOfHeapCommit(value: bigint | number) {
    this.view.setBigUint64(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.sizeOfHeapCommit,
      BigInt(value),
      true,
    );
  }

  /**
   * Obsolete loader flags; must be zero.
   *
   * @returns {number} The loader flags value.
   */
  public get ldrFlags(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.ldrFlags,
      true,
    );
  }

  /**
   * Sets the obsolete loader flags value; must be zero.
   *
   * @param {number} value The new loader flags value.
   */
  public set ldrFlags(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.ldrFlags,
      value,
      true,
    );
  }

  /**
   * Number of data-directory entries present in this header.
   *
   * @returns {number} The count of data-directory entries.
   */
  public get numDataDirectories(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.numDataDirectories,
      true,
    );
  }

  /**
   * Sets the number of data-directory entries present in this header.
   *
   * @param {number} value The new data-directory entry count.
   */
  public set numDataDirectories(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR64_OFFSETS.numDataDirectories,
      value,
      true,
    );
  }
}

/**
 * Optional Header for 32-bit (PE32) images. Image base and stack/heap
 * fields are 32-bit, widened to `bigint` for API consistency with
 * {@linkcode OptionalHeader64}.
 */
export class OptionalHeader32 extends BaseOptionalHeader {
  public static override readonly SIZE: number = 0xE0;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, OptionalHeader32.SIZE);
  }

  /**
   * RVA of the beginning of the initialized-data section.
   *
   * @returns {number} The base-of-data RVA.
   */
  public get baseOfData(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.baseOfData,
      true,
    );
  }

  /**
   * Sets the RVA of the beginning of the initialized-data section.
   *
   * @param {number} value The new base-of-data RVA.
   */
  public set baseOfData(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.baseOfData,
      value,
      true,
    );
  }

  /**
   * Preferred 32-bit load address of the image, widened to `bigint`.
   *
   * @returns {bigint} The image base address.
   */
  public get imageBase(): bigint {
    return BigInt(
      this.view.getUint32(
        CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.imageBase,
        true,
      ),
    );
  }

  /**
   * Sets the preferred 32-bit load address of the image.
   *
   * @param {bigint | number} value The new image base address.
   */
  public set imageBase(value: bigint | number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.imageBase,
      bigIntToInt(value),
      true,
    );
  }

  /**
   * Number of bytes to reserve for the stack (32-bit field, widened to `bigint`).
   *
   * @returns {bigint} The stack reserve size.
   */
  public get sizeOfStackReserve(): bigint {
    return BigInt(
      this.view.getUint32(
        CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfStackReserve,
        true,
      ),
    );
  }

  /**
   * Sets the number of bytes to reserve for the stack.
   *
   * @param {bigint | number} value The new stack reserve size in bytes.
   */
  public set sizeOfStackReserve(value: bigint | number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + 0x30,
      bigIntToInt(value),
      true,
    );
  }

  /**
   * Number of bytes to commit for the initial stack (32-bit field, widened to `bigint`).
   *
   * @returns {bigint} The stack commit size.
   */
  public get sizeOfStackCommit(): bigint {
    return BigInt(
      this.view.getUint32(
        CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfStackReserve,
        true,
      ),
    );
  }

  /**
   * Sets the number of bytes to commit for the initial stack.
   *
   * @param {bigint | number} value The new stack commit size in bytes.
   */
  public set sizeOfStackCommit(value: bigint | number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfStackCommit,
      bigIntToInt(value),
      true,
    );
  }

  /**
   * Number of bytes to reserve for the local heap (32-bit field, widened to `bigint`).
   *
   * @returns {bigint} The heap reserve size.
   */
  public get sizeOfHeapReserve(): bigint {
    return BigInt(
      this.view.getUint32(
        CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfHeapReserve,
        true,
      ),
    );
  }

  /**
   * Sets the number of bytes to reserve for the local heap.
   *
   * @param {bigint | number} value The new heap reserve size in bytes.
   */
  public set sizeOfHeapReserve(value: bigint | number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfHeapReserve,
      bigIntToInt(value),
      true,
    );
  }

  /**
   * Number of bytes to commit for the initial local heap (32-bit field, widened to `bigint`).
   *
   * @returns {bigint} The heap commit size.
   */
  public get sizeOfHeapCommit(): bigint {
    return BigInt(
      this.view.getUint32(
        CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfHeapCommit,
        true,
      ),
    );
  }

  /**
   * Sets the number of bytes to commit for the initial local heap.
   *
   * @param {bigint | number} value The new heap commit size in bytes.
   */
  public set sizeOfHeapCommit(value: bigint | number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.sizeOfHeapCommit,
      bigIntToInt(value),
      true,
    );
  }

  /**
   * Obsolete loader flags; must be zero.
   *
   * @returns {number} The loader flags value.
   */
  public get ldrFlags(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.ldrFlags,
      true,
    );
  }

  /**
   * Sets the obsolete loader flags value; must be zero.
   *
   * @param {number} value The new loader flags value.
   */
  public set ldrFlags(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.ldrFlags,
      value,
      true,
    );
  }

  /**
   * Number of data-directory entries present in this header.
   *
   * @returns {number} The count of data-directory entries.
   */
  public get numDataDirectories(): number {
    return this.view.getUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.numDataDirectories,
      true,
    );
  }

  /**
   * Sets the number of data-directory entries present in this header.
   *
   * @param {number} value The new data-directory entry count.
   */
  public set numDataDirectories(value: number) {
    this.view.setUint32(
      CoffOptionalHeader.SIZE + OPTIONAL_HDR32_OFFSETS.numDataDirectories,
      value,
      true,
    );
  }
}
