import { BaseFormat } from "../../_internal.ts";
import { IMPORT_DIR_OFFSETS } from "../../_offsets.ts";

/**
 * A single entry in the PE import directory table (`IMAGE_IMPORT_DESCRIPTOR`),
 * describing one imported DLL and its thunk chains.
 *
 * The import table is null-terminated; use {@linkcode isNull} to detect the
 * sentinel entry.
 */
export class ImportDirectory extends BaseFormat {
  public static override readonly SIZE: number = 20;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, ImportDirectory.SIZE);
  }

  /**
   * RVA of the import lookup table (ILT), also known as the original first
   * thunk array. Alias for {@linkcode rvaOriginalFirstThunk}.
   *
   * @returns {number} The RVA of the import lookup table.
   */
  public get characteristics(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.characteristics, true);
  }

  /**
   * Sets the characteristics / RVA of the import lookup table.
   *
   * @param {number} value The new RVA of the import lookup table.
   */
  public set characteristics(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.characteristics, value, true);
  }

  /**
   * RVA of the import lookup table (original first thunk array). Each entry
   * identifies an imported symbol by ordinal or by name.
   *
   * @returns {number} The RVA of the original first thunk array.
   */
  public get rvaOriginalFirstThunk(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.rvaOriginalFirstThunk, true);
  }

  /**
   * Sets the RVA of the import lookup table (original first thunk array).
   *
   * @param {number} value The new RVA of the original first thunk array.
   */
  public set rvaOriginalFirstThunk(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.rvaOriginalFirstThunk, value, true);
  }

  /**
   * Unix timestamp set to zero before binding, or to the DLL's timestamp
   * after the image has been bound.
   *
   * @returns {number} Seconds since the Unix epoch, or zero if unbound.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.timeDateStamp, true);
  }

  /**
   * Sets the bind timestamp of this import descriptor.
   *
   * @param {number} value Seconds since the Unix epoch, or zero to mark as unbound.
   */
  public set timeDateStamp(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.timeDateStamp, value, true);
  }

  /**
   * Index of the first forwarder reference in the bound import directory, or
   * `-1` if all imports are resolved.
   *
   * @returns {number} The forwarder chain index.
   */
  public get forwarderChain(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.forwarderChain, true);
  }

  /**
   * Sets the forwarder chain index.
   *
   * @param {number} value The new forwarder chain index.
   */
  public set forwarderChain(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.forwarderChain, value, true);
  }

  /**
   * RVA of the null-terminated ASCII name of the imported DLL.
   *
   * @returns {number} The RVA of the DLL name string.
   */
  public get rvaName(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.rvaName, true);
  }

  /**
   * Sets the RVA of the imported DLL name string.
   *
   * @param {number} value The new RVA of the DLL name.
   */
  public set rvaName(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.rvaName, value, true);
  }

  /**
   * RVA of the import address table (IAT / first thunk array). The loader
   * overwrites each entry with the resolved function address at load time.
   *
   * @returns {number} The RVA of the import address table.
   */
  public get rvaFirstThunk(): number {
    return this.view.getUint32(IMPORT_DIR_OFFSETS.rvaFirstThunk, true);
  }

  /**
   * Sets the RVA of the import address table (first thunk array).
   *
   * @param {number} value The new RVA of the import address table.
   */
  public set rvaFirstThunk(value: number) {
    this.view.setUint32(IMPORT_DIR_OFFSETS.rvaFirstThunk, value, true);
  }

  /**
   * Returns `true` when all three identifying RVA fields are zero, indicating
   * the null sentinel entry that terminates the import directory table.
   *
   * @returns {boolean} `true` if this is the null terminator entry.
   */
  public isNull(): boolean {
    return this.rvaName === 0 &&
      this.rvaFirstThunk === 0 &&
      this.rvaOriginalFirstThunk === 0;
  }
}
