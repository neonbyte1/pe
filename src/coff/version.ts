import { BaseFormat } from "../_internal.ts";

/**
 * An 8-byte version number split into a 32-bit major and a 32-bit minor
 * component, and a 64-bit combined identifier.
 */
export class Version64 extends BaseFormat {
  public static override readonly SIZE: number = 8;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, Version64.SIZE);
  }

  /**
   * Combined 64-bit version identifier (major in the low 32 bits).
   *
   * @returns {bigint} The full 64-bit version value.
   */
  public get identifier(): bigint {
    return this.view.getBigUint64(0, true);
  }

  /**
   * Sets the combined 64-bit version identifier.
   *
   * @param {bigint} value The new 64-bit version identifier.
   */
  public set identifier(value: bigint) {
    this.view.setBigUint64(0, value, true);
  }

  /**
   * Major version number (low 32 bits of the identifier).
   *
   * @returns {number} The major version.
   */
  public get major(): number {
    return this.view.getUint32(0, true);
  }

  /**
   * Sets the major version number.
   *
   * @param {number} value The new major version number.
   */
  public set major(value: number) {
    this.view.setUint32(0, value, true);
  }

  /**
   * Minor version number (high 32 bits of the identifier).
   *
   * @returns {number} The minor version.
   */
  public get minor(): number {
    return this.view.getUint32(4, true);
  }

  /**
   * Sets the minor version number.
   *
   * @param {number} value The new minor version number.
   */
  public set minor(value: number) {
    this.view.setUint32(4, value, true);
  }
}

/**
 * A 4-byte version number split into a 16-bit major and a 16-bit minor
 * component, and a 32-bit combined identifier.
 */
export class Version32 extends BaseFormat {
  public static override readonly SIZE: number = 4;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, Version32.SIZE);
  }

  /**
   * Combined 32-bit version identifier (major in the low 16 bits).
   *
   * @returns {number} The full 32-bit version value.
   */
  public get identifier(): number {
    return this.view.getUint32(0, true);
  }

  /**
   * Sets the combined 32-bit version identifier.
   *
   * @param {number} value The new 32-bit version identifier.
   */
  public set identifier(value: number) {
    this.view.setUint32(0, value, true);
  }

  /**
   * Major version number (low 16 bits of the identifier).
   *
   * @returns {number} The major version.
   */
  public get major(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Sets the major version number.
   *
   * @param {number} value The new major version number.
   */
  public set major(value: number) {
    this.view.setUint16(0, value, true);
  }

  /**
   * Minor version number (high 16 bits of the identifier).
   *
   * @returns {number} The minor version.
   */
  public get minor(): number {
    return this.view.getUint16(2, true);
  }

  /**
   * Sets the minor version number.
   *
   * @param {number} value The new minor version number.
   */
  public set minor(value: number) {
    this.view.setUint16(2, value, true);
  }
}

/**
 * A 2-byte version number split into an 8-bit major and an 8-bit minor
 * component, and a 16-bit combined identifier.
 */
export class Version16 extends BaseFormat {
  public static override readonly SIZE: number = 2;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, Version16.SIZE);
  }

  /**
   * Combined 16-bit version identifier (major in the low byte).
   *
   * @returns {number} The full 16-bit version value.
   */
  public get identifier(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Sets the combined 16-bit version identifier.
   *
   * @param {number} value The new 16-bit version identifier.
   */
  public set identifier(value: number) {
    this.view.setUint16(0, value, true);
  }

  /**
   * Major version number (low byte of the identifier).
   *
   * @returns {number} The major version.
   */
  public get major(): number {
    return this.view.getUint8(0);
  }

  /**
   * Sets the major version number.
   *
   * @param {number} value The new major version number.
   */
  public set major(value: number) {
    this.view.setUint8(0, value);
  }

  /**
   * Minor version number (high byte of the identifier).
   *
   * @returns {number} The minor version.
   */
  public get minor(): number {
    return this.view.getUint8(1);
  }

  /**
   * Sets the minor version number.
   *
   * @param {number} value The new minor version number.
   */
  public set minor(value: number) {
    this.view.setUint8(1, value);
  }
}
