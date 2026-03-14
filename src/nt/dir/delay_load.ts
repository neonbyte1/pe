import { BaseCharacteristics, BaseFormat } from "../../_internal.ts";
import { DELAY_LOAD_DIR_OFFSETS } from "../../_offsets.ts";

/**
 * Bit positions within the delay-load attributes field.
 * Use with {@linkcode DelayLoadAttributes} to test or toggle individual flags.
 */
export const enum DelayLoadAttributesBits {
  /** All RVAs in the descriptor are relative to the image base (v2 format). */
  RvaBased = 0,
}

/** Typed bitfield wrapper for the delay-load directory attributes dword. */
export class DelayLoadAttributes
  extends BaseCharacteristics<DelayLoadAttributesBits> {
  public static override readonly SIZE: number = 4;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this field begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, DelayLoadAttributes.SIZE);
  }

  /**
   * Raw 32-bit attributes value.
   *
   * @returns {number} The packed flags dword.
   */
  public get flags(): number {
    return this.view.getUint32(0, true);
  }

  /**
   * Sets the raw 32-bit attributes value.
   *
   * @param {number} value The new packed flags dword.
   */
  public set flags(value: number) {
    this.view.setUint32(0, value, true);
  }

  /**
   * When set, all RVA fields in the descriptor are relative to the image base
   * (v2 / RVA-based format). When clear, they are virtual addresses (v1).
   *
   * @returns {boolean} `true` if the flag is set.
   */
  public get rvaBased(): boolean {
    return this.isBitSet(DelayLoadAttributesBits.RvaBased);
  }

  /**
   * Sets whether RVA fields in the descriptor are image-base relative.
   *
   * @param {boolean} active `true` to set the flag, `false` to clear it.
   */
  public set rvaBased(active: boolean) {
    this.setBit(DelayLoadAttributesBits.RvaBased, active);
  }
}

/**
 * A single entry in the PE delay-load import directory
 * (`IMAGE_DELAYLOAD_DESCRIPTOR`), describing one DLL whose imports are
 * resolved lazily at first call rather than at image load time.
 */
export class DelayLoadDirectory extends BaseFormat {
  public static override readonly SIZE: number = 28;

  /** Attribute flags for this delay-load descriptor. */
  public readonly attributes: DelayLoadAttributes;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, DelayLoadDirectory.SIZE);

    this.attributes = new DelayLoadAttributes(
      data,
      offset + DELAY_LOAD_DIR_OFFSETS.attributes,
    );
  }

  /**
   * RVA of the null-terminated name of the delay-loaded DLL.
   *
   * @returns {number} The RVA of the DLL name string.
   */
  public get dllNameRva(): number {
    return this.view.getUint32(DELAY_LOAD_DIR_OFFSETS.dllNameRva, true);
  }

  /**
   * Sets the RVA of the delay-loaded DLL name string.
   *
   * @param {number} val The new RVA of the DLL name.
   */
  public set dllNameRva(val: number) {
    this.view.setUint32(DELAY_LOAD_DIR_OFFSETS.dllNameRva, val, true);
  }

  /**
   * RVA of the module handle slot used to cache the loaded DLL instance.
   *
   * @returns {number} The RVA of the module handle.
   */
  public get moduleHandleRva(): number {
    return this.view.getUint32(DELAY_LOAD_DIR_OFFSETS.moduleHandleRva, true);
  }

  /**
   * Sets the RVA of the module handle slot.
   *
   * @param {number} val The new RVA of the module handle.
   */
  public set moduleHandleRva(val: number) {
    this.view.setUint32(DELAY_LOAD_DIR_OFFSETS.moduleHandleRva, val, true);
  }

  /**
   * RVA of the delay-load import address table (IAT) for this DLL. The helper
   * stub overwrites entries here with the resolved addresses on first call.
   *
   * @returns {number} The RVA of the delay-load IAT.
   */
  public get importAddressTableRva(): number {
    return this.view.getUint32(
      DELAY_LOAD_DIR_OFFSETS.importAddressTableRva,
      true,
    );
  }

  /**
   * Sets the RVA of the delay-load import address table.
   *
   * @param {number} val The new RVA of the delay-load IAT.
   */
  public set importAddressTableRva(val: number) {
    this.view.setUint32(
      DELAY_LOAD_DIR_OFFSETS.importAddressTableRva,
      val,
      true,
    );
  }

  /**
   * RVA of the delay-load import name table (INT), parallel to the IAT and
   * containing the original thunk values for name/ordinal lookup.
   *
   * @returns {number} The RVA of the delay-load INT.
   */
  public get importNameTableRva(): number {
    return this.view.getUint32(DELAY_LOAD_DIR_OFFSETS.importNameTableRva, true);
  }

  /**
   * Sets the RVA of the delay-load import name table.
   *
   * @param {number} val The new RVA of the delay-load INT.
   */
  public set importNameTableRva(val: number) {
    this.view.setUint32(DELAY_LOAD_DIR_OFFSETS.importNameTableRva, val, true);
  }

  /**
   * RVA of the bound delay-load import address table, containing pre-computed
   * addresses from a previous bind operation. Zero if not bound.
   *
   * @returns {number} The RVA of the bound delay-load IAT.
   */
  public get boundImportAddressTableRva(): number {
    return this.view.getUint32(
      DELAY_LOAD_DIR_OFFSETS.boundImportAddressTableRva,
      true,
    );
  }

  /**
   * Sets the RVA of the bound delay-load import address table.
   *
   * @param {number} val The new RVA of the bound delay-load IAT.
   */
  public set boundImportAddressTableRva(val: number) {
    this.view.setUint32(
      DELAY_LOAD_DIR_OFFSETS.boundImportAddressTableRva,
      val,
      true,
    );
  }

  /**
   * RVA of the unload information table, used to restore the original IAT
   * entries if the DLL is explicitly unloaded. Zero if not present.
   *
   * @returns {number} The RVA of the unload information table.
   */
  public get unloadInformationTableRva(): number {
    return this.view.getUint32(
      DELAY_LOAD_DIR_OFFSETS.unloadInformationTableRva,
      true,
    );
  }

  /**
   * Sets the RVA of the unload information table.
   *
   * @param {number} val The new RVA of the unload information table.
   */
  public set unloadInformationTableRva(val: number) {
    this.view.setUint32(
      DELAY_LOAD_DIR_OFFSETS.unloadInformationTableRva,
      val,
      true,
    );
  }

  /**
   * Timestamp of the DLL at the time the image was bound. Zero if unbound.
   *
   * @returns {number} Seconds since the Unix epoch, or zero if unbound.
   */
  public get timeDateStamp(): number {
    return this.view.getUint32(DELAY_LOAD_DIR_OFFSETS.timeDateStamp, true);
  }

  /**
   * Sets the bind timestamp for this delay-load descriptor.
   *
   * @param {number} val Seconds since the Unix epoch, or zero to mark as unbound.
   */
  public set timeDateStamp(val: number) {
    this.view.setUint32(DELAY_LOAD_DIR_OFFSETS.timeDateStamp, val, true);
  }
}
