import { BaseFormat } from "../_internal.ts";
import { COFF_OPTIONAL_HDR_OFFSETS } from "../_offsets.ts";
import { Version16 } from "./version.ts";

/** Magic number identifying a PE32 (32-bit) optional header. */
export const IMAGE_NT_OPTIONAL_HDR32_MAGIC = 0x10B;

/** Magic number identifying a PE32+ (64-bit) optional header. */
export const IMAGE_NT_OPTIONAL_HDR64_MAGIC = 0x20B;

/**
 * The standard COFF optional header fields shared by both PE32 and PE32+
 * images (`IMAGE_OPTIONAL_HEADER` standard fields).
 *
 * This class is extended by {@linkcode OptionalHeader32} and
 * {@linkcode OptionalHeader64} which add the Windows-specific fields.
 */
export class CoffOptionalHeader extends BaseFormat {
  public static override readonly SIZE: number = 0x18;

  /** Linker version that produced this image. */
  public readonly linkerVersion: Version16;

  public constructor(data: Uint8Array, offset: number);
  public constructor(data: Uint8Array, offset: number, size: number);
  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this header begins.
   * @param {number} size Total byte size; defaults to {@linkcode CoffOptionalHeader.SIZE}.
   */
  public constructor(data: Uint8Array, offset: number, size?: number) {
    super(data, offset, size ?? CoffOptionalHeader.SIZE);

    this.linkerVersion = new Version16(
      data,
      offset + COFF_OPTIONAL_HDR_OFFSETS.linkerVersion,
    );
  }

  /**
   * Returns `true` when {@linkcode magic} equals
   * {@linkcode IMAGE_NT_OPTIONAL_HDR32_MAGIC} (PE32).
   *
   * @returns {boolean} `true` if this is a 32-bit optional header.
   */
  public is32Bit(): boolean {
    return this.magic === IMAGE_NT_OPTIONAL_HDR32_MAGIC;
  }

  /**
   * Returns `true` when {@linkcode magic} equals
   * {@linkcode IMAGE_NT_OPTIONAL_HDR64_MAGIC} (PE32+).
   *
   * @returns {boolean} `true` if this is a 64-bit optional header.
   */
  public is64Bit(): boolean {
    return this.magic === IMAGE_NT_OPTIONAL_HDR64_MAGIC;
  }

  /**
   * Magic number identifying the image format.
   * Use {@linkcode is32Bit} or {@linkcode is64Bit} for a convenient check.
   *
   * @returns {number} The 16-bit magic value.
   */
  public get magic(): number {
    return this.view.getUint16(COFF_OPTIONAL_HDR_OFFSETS.magic, true);
  }

  /**
   * Sets the magic number identifying the image format.
   *
   * @param {number} value The new magic value.
   */
  public set magic(value: number) {
    this.view.setUint16(COFF_OPTIONAL_HDR_OFFSETS.magic, value, true);
  }

  /**
   * Total byte size of all executable code sections.
   *
   * @returns {number} The size of code in bytes.
   */
  public get sizeOfCode(): number {
    return this.view.getUint32(COFF_OPTIONAL_HDR_OFFSETS.baseOfCode, true);
  }

  /**
   * Sets the total byte size of all executable code sections.
   *
   * @param {number} value The new size of code in bytes.
   */
  public set sizeOfCode(value: number) {
    this.view.setUint32(COFF_OPTIONAL_HDR_OFFSETS.sizeofCode, value, true);
  }

  /**
   * Total byte size of all initialized-data sections.
   *
   * @returns {number} The size of initialized data in bytes.
   */
  public get sizeOfInitData(): number {
    return this.view.getUint32(COFF_OPTIONAL_HDR_OFFSETS.sizeofInitData, true);
  }

  /**
   * Sets the total byte size of all initialized-data sections.
   *
   * @param {number} value The new size of initialized data in bytes.
   */
  public set sizeOfInitData(value: number) {
    this.view.setUint32(COFF_OPTIONAL_HDR_OFFSETS.sizeofInitData, value, true);
  }

  /**
   * Total byte size of all uninitialized-data (BSS) sections.
   *
   * @returns {number} The size of uninitialized data in bytes.
   */
  public get sizeOfUninitData(): number {
    return this.view.getUint32(
      COFF_OPTIONAL_HDR_OFFSETS.sizeofUninitData,
      true,
    );
  }

  /**
   * Sets the total byte size of all uninitialized-data (BSS) sections.
   *
   * @param {number} value The new size of uninitialized data in bytes.
   */
  public set sizeOfUninitData(value: number) {
    this.view.setUint32(
      COFF_OPTIONAL_HDR_OFFSETS.sizeofUninitData,
      value,
      true,
    );
  }

  /**
   * RVA of the image entry point. For DLLs this field is optional and may
   * be zero.
   *
   * @returns {number} The entry-point RVA.
   */
  public get entryPoint(): number {
    return this.view.getUint32(COFF_OPTIONAL_HDR_OFFSETS.entryPoint, true);
  }

  /**
   * Sets the RVA of the image entry point.
   *
   * @param {number} value The new entry-point RVA.
   */
  public set entryPoint(value: number) {
    this.view.setUint32(COFF_OPTIONAL_HDR_OFFSETS.entryPoint, value, true);
  }

  /**
   * RVA of the beginning of the code section when loaded into memory.
   *
   * @returns {number} The base-of-code RVA.
   */
  public get baseOfCode(): number {
    return this.view.getUint32(COFF_OPTIONAL_HDR_OFFSETS.baseOfCode, true);
  }

  /**
   * Sets the RVA of the beginning of the code section.
   *
   * @param {number} value The new base-of-code RVA.
   */
  public set baseOfCode(value: number) {
    this.view.setUint32(COFF_OPTIONAL_HDR_OFFSETS.baseOfCode, value, true);
  }
}
