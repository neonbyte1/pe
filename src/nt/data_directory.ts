import { BaseFormat } from "../_internal.ts";
import { DATA_DIRECTORY_OFFSETS } from "../_offsets.ts";

/**
 * A single 8-byte entry in the PE data-directory array, consisting of a
 * Relative Virtual Address and a byte size.
 *
 * Use {@linkcode present} to check whether the directory exists before
 * accessing its contents.
 */
export class DataDirectory extends BaseFormat {
  public static override readonly SIZE: number = 8;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, DataDirectory.SIZE);
  }

  /**
   * Relative Virtual Address of the directory data.
   *
   * @returns {number} The RVA, or `0` if the directory is absent.
   */
  public get rva(): number {
    return this.view.getUint32(DATA_DIRECTORY_OFFSETS.rva, true);
  }

  /**
   * Sets the Relative Virtual Address of the directory data.
   *
   * @param {number} value The new RVA, or `0` to mark the directory as absent.
   */
  public set rva(value: number) {
    this.view.setUint32(DATA_DIRECTORY_OFFSETS.rva, value, true);
  }

  /**
   * Byte size of the directory data.
   *
   * @returns {number} The size in bytes, or `0` if the directory is absent.
   */
  public get size(): number {
    return this.view.getUint32(DATA_DIRECTORY_OFFSETS.size, true);
  }

  /**
   * Sets the byte size of the directory data.
   *
   * @param {number} value The new size in bytes, or `0` to mark the directory as absent.
   */
  public set size(value: number) {
    this.view.setUint32(DATA_DIRECTORY_OFFSETS.size, value, true);
  }

  /**
   * Returns `true` when both {@linkcode rva} and {@linkcode size} are non-zero.
   *
   * @returns {boolean} `true` if this directory entry is present.
   */
  public present(): boolean {
    return this.rva > 0 && this.size > 0;
  }
}
