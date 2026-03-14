import {
  BaseCharacteristics,
  BaseFormat,
  bigIntToUint,
} from "../../_internal.ts";
import { TLS_DIR32_OFFSETS, TLS_DIR64_OFFSETS } from "../../_offsets.ts";

/**
 * Bit positions within the TLS directory characteristics field.
 * Use with {@linkcode TlsCharacteristics} to read or write the alignment
 * nibble.
 */
export const enum TlsCharacteristicsBits {
  /** Starting bit of the 4-bit section-alignment nibble. */
  Alignment = 20,
}

/** Typed wrapper for the TLS directory characteristics dword. */
export class TlsCharacteristics
  extends BaseCharacteristics<TlsCharacteristicsBits> {
  public static override readonly SIZE: number = 4;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, TlsCharacteristics.SIZE);
  }

  /**
   * Raw 32-bit characteristics value.
   *
   * @returns {number} The packed flags dword.
   */
  public get flags(): number {
    return this.view.getUint32(0, true);
  }

  /**
   * Sets the raw 32-bit characteristics value.
   *
   * @param {number} value The new packed flags dword.
   */
  public set flags(value: number) {
    this.view.setUint32(0, value, true);
  }

  /**
   * 4-bit section-alignment nibble extracted from bits 20–23 of the
   * characteristics field.
   *
   * @returns {number} The raw 4-bit alignment nibble.
   */
  public get alignment(): number {
    return (this.flags >> TlsCharacteristicsBits.Alignment) & 0xf;
  }

  /**
   * Sets the 4-bit section-alignment nibble in bits 20–23 of the
   * characteristics field.
   *
   * @param {number} value The new 4-bit alignment nibble.
   */
  public set alignment(value: number) {
    const mask = 0xf << TlsCharacteristicsBits.Alignment;

    this.flags = (this.flags & ~mask) |
      ((value & 0xf) << TlsCharacteristicsBits.Alignment);
  }
}

/**
 * A TLS callback descriptor returned by
 * {@linkcode BaseTlsDirectory.getCallbacks}, identifying a callback function
 * by its index in the callback array and its virtual address.
 */
export interface TlsCallbackInfo {
  /** Zero-based index of the callback in the TLS callback array. */
  index: number;
  /** Virtual address of the callback function. */
  rva: number;
}

abstract class BaseTlsDirectory extends BaseFormat {
  /** Section characteristics and alignment flags for the TLS data. */
  public readonly characteristics: TlsCharacteristics;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this directory begins.
   * @param {number} size Total byte size of the concrete directory variant.
   */
  protected constructor(data: Uint8Array, offset: number, size: number) {
    super(data, offset, size);

    this.characteristics = new TlsCharacteristics(
      data,
      offset + size - TlsCharacteristics.SIZE,
    );
  }

  /**
   * Virtual address of the start of the TLS template raw-data region.
   *
   * @returns {bigint} The start address of the TLS template.
   */
  public abstract get addressRawDataStart(): bigint;

  /**
   * Sets the start address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new start address.
   */
  public abstract set addressRawDataStart(value: bigint | number);

  /**
   * Virtual address of the end of the TLS template raw-data region (one byte
   * past the last byte of template data).
   *
   * @returns {bigint} The end address of the TLS template.
   */
  public abstract get addressRawDataEnd(): bigint;

  /**
   * Sets the end address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new end address.
   */
  public abstract set addressRawDataEnd(value: bigint | number);

  /**
   * Virtual address of the TLS index slot. The loader stores the module's TLS
   * index here at load time.
   *
   * @returns {bigint} The address of the TLS index slot.
   */
  public abstract get addressIndex(): bigint;

  /**
   * Sets the address of the TLS index slot.
   *
   * @param {bigint | number} value The new address of the TLS index slot.
   */
  public abstract set addressIndex(value: bigint | number);

  /**
   * Virtual address of the null-terminated array of TLS callback function
   * pointers. Zero if there are no callbacks.
   *
   * @returns {bigint} The address of the TLS callback array.
   */
  public abstract get addressCallbacks(): bigint;

  /**
   * Sets the address of the TLS callback array.
   *
   * @param {bigint | number} value The new address of the TLS callback array.
   */
  public abstract set addressCallbacks(value: bigint | number);

  /**
   * Number of bytes of zero fill to append to each TLS slot beyond the
   * template data.
   *
   * @returns {number} The zero-fill size in bytes.
   */
  public abstract get sizeZeroFill(): number;

  /**
   * Sets the number of zero-fill bytes appended to each TLS slot.
   *
   * @param {number} value The new zero-fill size in bytes.
   */
  public abstract set sizeZeroFill(value: number);

  /**
   * Parses the null-terminated TLS callback pointer array and returns every
   * non-null callback as a {@linkcode TlsCallbackInfo} descriptor.
   *
   * @returns {TlsCallbackInfo[]} Array of callback descriptors in array order.
   */
  public getCallbacks(): TlsCallbackInfo[] {
    const callbacks: TlsCallbackInfo[] = [];
    const start = this.addressCallbacks;

    if (start) {
      const data = this.view.buffer;
      const pointerSize = this instanceof TlsDirectory64
        ? TlsDirectory64.SIZE
        : TlsDirectory32.SIZE;
      let offset = this.view.byteOffset + Number(start);
      let index = 0;

      while (true) {
        let rva: bigint;

        if (pointerSize === 8) {
          if (offset + 8 > data.byteLength) {
            break;
          }

          rva = new DataView(data).getBigUint64(offset, true);
        } else {
          if (offset + 4 > data.byteLength) {
            break;
          }

          rva = BigInt(new DataView(data).getUint32(offset, true));
        }

        if (rva === 0n) {
          // null-terminated

          break;
        }

        callbacks.push({ index, rva: Number(rva) });
        index++;
        offset += pointerSize;
      }
    }

    return callbacks;
  }
}

/**
 * TLS directory for 64-bit (PE32+) images. All address fields are 64-bit
 * virtual addresses stored as `bigint`.
 */
export class TlsDirectory64 extends BaseTlsDirectory {
  public static override readonly SIZE: number = 0x28;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this directory begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, TlsDirectory64.SIZE);
  }

  /**
   * Virtual address of the start of the TLS template raw-data region.
   *
   * @returns {bigint} The 64-bit start address.
   */
  public get addressRawDataStart(): bigint {
    return this.view.getBigUint64(TLS_DIR64_OFFSETS.addressRawDataStart, true);
  }

  /**
   * Sets the start address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new 64-bit start address.
   */
  public set addressRawDataStart(value: bigint | number) {
    this.view.setBigUint64(
      TLS_DIR64_OFFSETS.addressRawDataStart,
      BigInt(value),
      true,
    );
  }

  /**
   * Virtual address of the end of the TLS template raw-data region.
   *
   * @returns {bigint} The 64-bit end address.
   */
  public get addressRawDataEnd(): bigint {
    return this.view.getBigUint64(TLS_DIR64_OFFSETS.addressRawDataEnd, true);
  }

  /**
   * Sets the end address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new 64-bit end address.
   */
  public set addressRawDataEnd(value: bigint | number) {
    this.view.setBigUint64(
      TLS_DIR64_OFFSETS.addressRawDataEnd,
      BigInt(value),
      true,
    );
  }

  /**
   * Virtual address of the TLS index slot.
   *
   * @returns {bigint} The 64-bit address of the TLS index.
   */
  public get addressIndex(): bigint {
    return this.view.getBigUint64(TLS_DIR64_OFFSETS.addressIndex, true);
  }

  /**
   * Sets the address of the TLS index slot.
   *
   * @param {bigint | number} value The new 64-bit address of the TLS index.
   */
  public set addressIndex(value: bigint | number) {
    this.view.setBigUint64(TLS_DIR64_OFFSETS.addressIndex, BigInt(value), true);
  }

  /**
   * Virtual address of the null-terminated TLS callback array.
   *
   * @returns {bigint} The 64-bit address of the callback array.
   */
  public get addressCallbacks(): bigint {
    return this.view.getBigUint64(TLS_DIR64_OFFSETS.addressCallbacks, true);
  }

  /**
   * Sets the address of the null-terminated TLS callback array.
   *
   * @param {bigint | number} value The new 64-bit address of the callback array.
   */
  public set addressCallbacks(value: bigint | number) {
    this.view.setBigUint64(
      TLS_DIR64_OFFSETS.addressCallbacks,
      BigInt(value),
      true,
    );
  }

  /**
   * Number of bytes of zero fill appended to each TLS slot beyond the template.
   *
   * @returns {number} The zero-fill size in bytes.
   */
  public get sizeZeroFill(): number {
    return this.view.getUint32(TLS_DIR64_OFFSETS.sizeZeroFill, true);
  }

  /**
   * Sets the number of zero-fill bytes appended to each TLS slot.
   *
   * @param {number} value The new zero-fill size in bytes.
   */
  public set sizeZeroFill(value: number) {
    this.view.setUint32(TLS_DIR64_OFFSETS.sizeZeroFill, value, true);
  }
}

/**
 * TLS directory for 32-bit (PE32) images. Address fields are 32-bit virtual
 * addresses, widened to `bigint` for API consistency with
 * {@linkcode TlsDirectory64}.
 */
export class TlsDirectory32 extends BaseTlsDirectory {
  public static override readonly SIZE: number = 0x18;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this directory begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, TlsDirectory32.SIZE);
  }

  /**
   * Virtual address of the start of the TLS template raw-data region,
   * widened to `bigint`.
   *
   * @returns {bigint} The 32-bit start address as `bigint`.
   */
  public get addressRawDataStart(): bigint {
    return BigInt(
      this.view.getUint32(TLS_DIR32_OFFSETS.addressRawDataStart, true),
    );
  }

  /**
   * Sets the 32-bit start address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new start address.
   */
  public set addressRawDataStart(value: bigint | number) {
    this.view.setUint32(
      TLS_DIR32_OFFSETS.addressRawDataStart,
      bigIntToUint(value),
      true,
    );
  }

  /**
   * Virtual address of the end of the TLS template raw-data region, widened
   * to `bigint`.
   *
   * @returns {bigint} The 32-bit end address as `bigint`.
   */
  public get addressRawDataEnd(): bigint {
    return BigInt(
      this.view.getUint32(TLS_DIR32_OFFSETS.addressRawDataEnd, true),
    );
  }

  /**
   * Sets the 32-bit end address of the TLS template raw-data region.
   *
   * @param {bigint | number} value The new end address.
   */
  public set addressRawDataEnd(value: bigint | number) {
    this.view.setUint32(
      TLS_DIR32_OFFSETS.addressRawDataEnd,
      bigIntToUint(value),
      true,
    );
  }

  /**
   * Virtual address of the TLS index slot, widened to `bigint`.
   *
   * @returns {bigint} The 32-bit address of the TLS index as `bigint`.
   */
  public get addressIndex(): bigint {
    return BigInt(this.view.getUint32(TLS_DIR32_OFFSETS.addressIndex, true));
  }

  /**
   * Sets the 32-bit address of the TLS index slot.
   *
   * @param {bigint | number} value The new address of the TLS index.
   */
  public set addressIndex(value: bigint | number) {
    this.view.setUint32(
      TLS_DIR32_OFFSETS.addressIndex,
      bigIntToUint(value),
      true,
    );
  }

  /**
   * Virtual address of the null-terminated TLS callback array, widened to
   * `bigint`.
   *
   * @returns {bigint} The 32-bit address of the callback array as `bigint`.
   */
  public get addressCallbacks(): bigint {
    return BigInt(
      this.view.getUint32(TLS_DIR32_OFFSETS.addressCallbacks, true),
    );
  }

  /**
   * Sets the 32-bit address of the null-terminated TLS callback array.
   *
   * @param {bigint | number} value The new address of the callback array.
   */
  public set addressCallbacks(value: bigint | number) {
    this.view.setUint32(
      TLS_DIR32_OFFSETS.addressCallbacks,
      bigIntToUint(value),
      true,
    );
  }

  /**
   * Number of bytes of zero fill appended to each TLS slot beyond the template.
   *
   * @returns {number} The zero-fill size in bytes.
   */
  public get sizeZeroFill(): number {
    return this.view.getUint32(TLS_DIR32_OFFSETS.sizeZeroFill, true);
  }

  /**
   * Sets the number of zero-fill bytes appended to each TLS slot.
   *
   * @param {number} value The new zero-fill size in bytes.
   */
  public set sizeZeroFill(value: number) {
    this.view.setUint32(TLS_DIR32_OFFSETS.sizeZeroFill, value, true);
  }
}
