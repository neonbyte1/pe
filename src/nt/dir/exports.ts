import { BaseFormat } from "../../_internal.ts";
import { EXPORT_DIR_OFFSETS } from "../../_offsets.ts";
import { Version32 } from "../../coff/version.ts";

/**
 * The PE export directory (`IMAGE_EXPORT_DIRECTORY`) that describes all
 * symbols exported by a DLL or EXE.
 *
 * Use {@linkcode PeImage.collectExports} to obtain a higher-level list of
 * {@linkcode ExportInfo} objects instead of reading this structure directly.
 */
export class ExportDirectory extends BaseFormat {
  public static override readonly SIZE: number = 0x28;

  /** Version of the exported interface. */
  public readonly version: Version32;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this directory begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, ExportDirectory.SIZE);

    this.version = new Version32(data, offset + EXPORT_DIR_OFFSETS.version);
  }

  /**
   * Reserved characteristics field; must be zero.
   *
   * @returns {number} The characteristics value.
   */
  public get characteristics(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.characteristics, true);
  }

  /**
   * Sets the reserved characteristics field.
   *
   * @param {number} value The new characteristics value.
   */
  public set characteristics(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.characteristics, value, true);
  }

  /**
   * Unix timestamp indicating when the export table was created.
   *
   * @returns {number} Seconds since the Unix epoch.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.timeDateStamp, true);
  }

  /**
   * Sets the creation timestamp of the export table.
   *
   * @param {number} value Seconds since the Unix epoch.
   */
  public set timeDateStamp(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.timeDateStamp, value, true);
  }

  /**
   * RVA of the null-terminated ASCII name of the exporting module.
   *
   * @returns {number} The RVA of the module name string.
   */
  public get name(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.name, true);
  }

  /**
   * Sets the RVA of the null-terminated module name string.
   *
   * @param {number} value The new RVA of the module name.
   */
  public set name(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.name, value, true);
  }

  /**
   * Ordinal base value. The ordinal of the first entry in the export address
   * table equals this value.
   *
   * @returns {number} The ordinal base.
   */
  public get base(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.base, true);
  }

  /**
   * Sets the ordinal base value.
   *
   * @param {number} value The new ordinal base.
   */
  public set base(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.base, value, true);
  }

  /**
   * Number of entries in the export address table.
   *
   * @returns {number} The function count.
   */
  public get numFunctions(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.numFunctions, true);
  }

  /**
   * Sets the number of entries in the export address table.
   *
   * @param {number} value The new function count.
   */
  public set numFunctions(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.numFunctions, value, true);
  }

  /**
   * Number of entries in the name pointer and ordinal tables.
   *
   * @returns {number} The named-export count.
   */
  public get numNames(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.numNames, true);
  }

  /**
   * Sets the number of entries in the name pointer and ordinal tables.
   *
   * @param {number} value The new named-export count.
   */
  public set numNames(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.numNames, value, true);
  }

  /**
   * RVA of the export address table (array of function RVAs or forwarder strings).
   *
   * @returns {number} The RVA of the export address table.
   */
  public get rvaFunctions(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.rvaFunctions, true);
  }

  /**
   * Sets the RVA of the export address table.
   *
   * @param {number} value The new RVA of the export address table.
   */
  public set rvaFunctions(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.rvaFunctions, value, true);
  }

  /**
   * RVA of the export name pointer table (array of RVAs to null-terminated names).
   *
   * @returns {number} The RVA of the name pointer table.
   */
  public get rvaNames(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.rvaNames, true);
  }

  /**
   * Sets the RVA of the export name pointer table.
   *
   * @param {number} value The new RVA of the name pointer table.
   */
  public set rvaNames(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.rvaNames, value, true);
  }

  /**
   * RVA of the ordinal table (array of 16-bit ordinals parallel to the name
   * pointer table).
   *
   * @returns {number} The RVA of the ordinal table.
   */
  public get rvaNameOrdinals(): number {
    return this.view.getUint32(EXPORT_DIR_OFFSETS.rvaNameOrdinals, true);
  }

  /**
   * Sets the RVA of the ordinal table.
   *
   * @param {number} value The new RVA of the ordinal table.
   */
  public set rvaNameOrdinals(value: number) {
    this.view.setUint32(EXPORT_DIR_OFFSETS.rvaNameOrdinals, value, true);
  }
}
