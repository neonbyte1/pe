import {
  BaseFormat,
  bigIntToInt,
  readAsciiUntilNull,
} from "../../_internal.ts";
import {
  BOUNDED_FORWARDER_REF_OFFSETS,
  BOUNDED_IMPORT_DESCRIPTOR_OFFSETS,
} from "../../_offsets.ts";

/**
 * An `IMAGE_IMPORT_BY_NAME` record containing a 2-byte ordinal hint and a
 * null-terminated symbol name used to resolve a named import.
 */
export class ImageNamedImport extends BaseFormat {
  public static override readonly SIZE: number = 3;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this record begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, ImageNamedImport.SIZE);
  }

  /**
   * Loader hint: the expected ordinal index of this export in the target DLL's
   * export address table. Used to accelerate resolution; not authoritative.
   *
   * @returns {number} The 16-bit hint value.
   */
  public get hint(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Sets the ordinal hint value.
   *
   * @param {number} value The new 16-bit hint value.
   */
  public set hint(value: number) {
    this.view.setUint16(0, value, true);
  }

  /**
   * Null-terminated ASCII name of the imported symbol, read directly from the
   * image buffer following the hint field.
   *
   * @returns {string} The symbol name.
   */
  public get name(): string {
    const data = new Uint8Array(
      this.view.buffer,
      this.view.byteOffset + 2,
      this.view.buffer.byteLength - (this.view.byteOffset + 2),
    );

    return readAsciiUntilNull(data, 0, data.length);
  }

  /**
   * Writes a null-terminated ASCII symbol name into the image buffer following
   * the hint field.
   *
   * @param {string} str The new symbol name to write.
   */
  public set name(str: string) {
    const bytes = new TextEncoder().encode(str + "\0");
    new Uint8Array(this.view.buffer, this.view.byteOffset + 2, bytes.length)
      .set(bytes);
  }
}

/**
 * Abstract base for a single thunk-data entry in an import or IAT array.
 * Concrete subclasses are {@linkcode ImageThunkData32} (PE32) and
 * {@linkcode ImageThunkData64} (PE32+).
 *
 * The union fields (`forwarderString`, `function`, `address`,
 * `addressOfData`) all alias the same underlying value.
 */
export abstract class BaseImageThunkData extends BaseFormat {
  /**
   * Raw thunk value used as a forwarder string RVA before binding.
   *
   * @returns {bigint} The raw thunk value.
   */
  public abstract get forwarderString(): bigint;

  /**
   * Sets the raw thunk value.
   *
   * @param {bigint | number} value The new raw thunk value.
   */
  public abstract set forwarderString(value: bigint | number);

  /**
   * Alias of {@linkcode forwarderString} representing the function pointer
   * after the image has been bound by the loader.
   *
   * @returns {bigint} The raw thunk value.
   */
  public get function(): bigint {
    return this.forwarderString;
  }

  /**
   * Sets the function pointer alias of the thunk value.
   *
   * @param {bigint | number} value The new thunk value.
   */
  public set function(value: bigint | number) {
    this.forwarderString = value;
  }

  /**
   * Alias of {@linkcode forwarderString} representing the virtual address
   * after binding.
   *
   * @returns {bigint} The raw thunk value.
   */
  public get address(): bigint {
    return this.forwarderString;
  }

  /**
   * Sets the address alias of the thunk value.
   *
   * @param {bigint | number} value The new thunk value.
   */
  public set address(value: bigint | number) {
    this.forwarderString = value;
  }

  /**
   * Alias of {@linkcode forwarderString} representing the RVA of the
   * {@linkcode ImageNamedImport} record when the high bit is clear.
   *
   * @returns {bigint} The raw thunk value.
   */
  public get addressOfData(): bigint {
    return this.forwarderString;
  }

  /**
   * Sets the address-of-data alias of the thunk value.
   *
   * @param {bigint | number} value The new thunk value.
   */
  public set addressOfData(value: bigint | number) {
    this.forwarderString = value;
  }

  /**
   * Ordinal value of the import when {@linkcode isOrdinal} is `true`.
   *
   * @returns {number} The 16-bit ordinal.
   */
  public abstract get ordinal(): number;

  /**
   * Returns `true` when the high bit of the thunk value is set, indicating
   * that the import is resolved by ordinal rather than by name.
   *
   * @returns {boolean} `true` if this is an ordinal import.
   */
  public abstract get isOrdinal(): boolean;
}

/**
 * A 64-bit thunk-data entry used in PE32+ (64-bit) images.
 * The high bit (bit 63) of the value indicates an ordinal import.
 */
export class ImageThunkData64 extends BaseImageThunkData {
  public static override readonly SIZE: number = 8;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, ImageThunkData64.SIZE);
  }

  /**
   * Raw 64-bit thunk value.
   *
   * @returns {bigint} The thunk value.
   */
  public get forwarderString(): bigint {
    return this.view.getBigUint64(0, true);
  }

  /**
   * Sets the raw 64-bit thunk value.
   *
   * @param {bigint | number} value The new thunk value.
   */
  public set forwarderString(value: bigint | number) {
    this.view.setBigUint64(0, BigInt(value), true);
  }

  /**
   * Low 16 bits of the thunk value, used as the import ordinal when
   * {@linkcode isOrdinal} is `true`.
   *
   * @returns {number} The 16-bit ordinal.
   */
  public get ordinal(): number {
    return Number(this.forwarderString & 0xffffn);
  }

  /**
   * Returns `true` when bit 63 of the thunk value is set, indicating an
   * ordinal import.
   *
   * @returns {boolean} `true` if this entry represents an ordinal import.
   */
  public get isOrdinal(): boolean {
    const value = this.forwarderString;

    return (value >> 63n & 1n) !== 0n;
  }
}

/**
 * A 32-bit thunk-data entry used in PE32 (32-bit) images.
 * The high bit (bit 31) of the value indicates an ordinal import.
 */
export class ImageThunkData32 extends BaseImageThunkData {
  public static override readonly SIZE: number = 4;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, ImageThunkData32.SIZE);
  }

  /**
   * Raw 32-bit thunk value, widened to `bigint` for API consistency with
   * {@linkcode ImageThunkData64}.
   *
   * @returns {bigint} The thunk value.
   */
  public get forwarderString(): bigint {
    return BigInt(this.view.getUint32(0, true));
  }

  /**
   * Sets the raw 32-bit thunk value.
   *
   * @param {bigint | number} value The new thunk value.
   */
  public set forwarderString(value: bigint | number) {
    this.view.setUint32(0, bigIntToInt(value), true);
  }

  /**
   * Low 16 bits of the thunk value, used as the import ordinal when
   * {@linkcode isOrdinal} is `true`.
   *
   * @returns {number} The 16-bit ordinal.
   */
  public get ordinal(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Returns `true` when bit 31 of the thunk value is set, indicating an
   * ordinal import.
   *
   * @returns {boolean} `true` if this entry represents an ordinal import.
   */
  public get isOrdinal(): boolean {
    const value = this.view.getUint32(0, true);

    return (value >> 31 & 1) !== 0;
  }
}

/**
 * An `IMAGE_BOUND_FORWARDER_REF` entry that records a forwarded import within
 * a bound import descriptor chain.
 */
export class BoundForwarderRef extends BaseFormat {
  public static override readonly SIZE: number = 8;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, BoundForwarderRef.SIZE);
  }

  /**
   * Timestamp of the DLL that contains the forwarded export, used to validate
   * the binding at load time.
   *
   * @returns {number} Seconds since the Unix epoch.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(
      BOUNDED_FORWARDER_REF_OFFSETS.timeDateStamp,
      true,
    );
  }

  /**
   * Sets the timestamp of the forwarded DLL.
   *
   * @param {number} value Seconds since the Unix epoch.
   */
  public set timeDateStamp(value: number) {
    this.view.setUint32(
      BOUNDED_FORWARDER_REF_OFFSETS.timeDateStamp,
      value,
      true,
    );
  }

  /**
   * Offset from the start of the bound import directory to the name of the
   * forwarded DLL.
   *
   * @returns {number} The byte offset of the forwarded module name.
   */
  public get offsetModuleName(): number {
    return this.view.getUint32(
      BOUNDED_FORWARDER_REF_OFFSETS.offsetModuleName,
      true,
    );
  }

  /**
   * Sets the offset of the forwarded module name within the bound import directory.
   *
   * @param {number} value The new byte offset of the module name.
   */
  public set offsetModuleName(value: number) {
    this.view.setUint32(
      BOUNDED_FORWARDER_REF_OFFSETS.offsetModuleName,
      value,
      true,
    );
  }
}

/**
 * An `IMAGE_BOUND_IMPORT_DESCRIPTOR` entry in the bound import directory,
 * recording the pre-computed binding information for one imported DLL.
 */
export class BoundImportDescriptor extends BaseFormat {
  public static override readonly SIZE: number = 8;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, BoundImportDescriptor.SIZE);
  }

  /**
   * Timestamp of the imported DLL at the time the image was bound. The loader
   * compares this value against the DLL's current timestamp to detect stale bindings.
   *
   * @returns {number} Seconds since the Unix epoch.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.timeDateStamp,
      true,
    );
  }

  /**
   * Sets the bind timestamp of the imported DLL.
   *
   * @param {number} value Seconds since the Unix epoch.
   */
  public set timeDateStamp(value: number) {
    this.view.setUint32(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.timeDateStamp,
      value,
      true,
    );
  }

  /**
   * Offset from the start of the bound import directory to the null-terminated
   * name of the imported module.
   *
   * @returns {number} The byte offset of the module name.
   */
  public get offsetModuleName(): number {
    return this.view.getUint16(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.offsetModuleName,
      true,
    );
  }

  /**
   * Sets the offset of the module name within the bound import directory.
   *
   * @param {number} value The new byte offset of the module name.
   */
  public set offsetModuleName(value: number) {
    this.view.setUint16(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.offsetModuleName,
      value,
      true,
    );
  }

  /**
   * Number of {@linkcode BoundForwarderRef} entries that immediately follow
   * this descriptor.
   *
   * @returns {number} The forwarder-reference count.
   */
  public get numModuleForwarderRefs(): number {
    return this.view.getUint16(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.numModuleForwarderRefs,
      true,
    );
  }

  /**
   * Sets the number of forwarder-reference entries that follow this descriptor.
   *
   * @param {number} value The new forwarder-reference count.
   */
  public set numModuleForwarderRefs(value: number) {
    this.view.setUint16(
      BOUNDED_IMPORT_DESCRIPTOR_OFFSETS.numModuleForwarderRefs,
      value,
      true,
    );
  }
}
