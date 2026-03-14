import { BaseFormat } from "../_internal.ts";
import { DOS_HDR_OFFSETS } from "../_offsets.ts";

/** Magic number (`0x5A4D`, ASCII `"MZ"`) that identifies a valid DOS header. */
export const IMAGE_DOS_SIGNATURE = 0x5A4D; // 'MZ'

/**
 * The legacy DOS header that appears at offset 0 of every PE file.
 *
 * The only fields that are meaningful for PE files are {@linkcode magic}
 * (must equal {@linkcode IMAGE_DOS_SIGNATURE}) and {@linkcode nextHdrOffset}
 * (the file offset of the PE signature / NT headers).
 */
export class DosHeader extends BaseFormat {
  public static override readonly SIZE: number = 0x40;

  /**
   * @param {Uint8Array} data The raw image buffer. The header is always read
   *   from offset 0.
   */
  public constructor(data: Uint8Array) {
    super(data, 0, DosHeader.SIZE);
  }

  /**
   * Returns `true` when the {@linkcode magic} field equals
   * {@linkcode IMAGE_DOS_SIGNATURE}.
   *
   * @returns {boolean} `true` if the magic number is valid.
   */
  public isValid(): boolean {
    return this.magic === IMAGE_DOS_SIGNATURE;
  }

  /**
   * DOS magic number - must be `0x5A4D` (`"MZ"`) for a valid PE file.
   *
   * @returns {number} The 16-bit magic value.
   */
  public get magic(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.magic, true);
  }

  /**
   * Sets the DOS magic number.
   *
   * @param {number} value The new 16-bit magic value.
   */
  public set magic(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.magic, value, true);
  }

  /**
   * Number of bytes used on the last page of the DOS stub.
   *
   * @returns {number} Bytes on the last page, or 0 if the last page is full.
   */
  public get numBytesLastPage(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.numBytesLastPage, true);
  }

  /**
   * Sets the number of bytes used on the last page of the DOS stub.
   *
   * @param {number} value Bytes on the last page, or 0 if the last page is full.
   */
  public set numBytesLastPage(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.numBytesLastPage, value, true);
  }

  /**
   * Total number of 512-byte pages in the DOS stub, including the last page.
   *
   * @returns {number} The page count.
   */
  public get numPages(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.numPages, true);
  }

  /**
   * Sets the total number of 512-byte pages in the DOS stub.
   *
   * @param {number} value The new page count.
   */
  public set numPages(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.numPages, value, true);
  }

  /**
   * Number of relocation entries in the DOS relocation table.
   *
   * @returns {number} The relocation count.
   */
  public get numRelocs(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.numRelocs, true);
  }

  /**
   * Sets the number of relocation entries in the DOS relocation table.
   *
   * @param {number} value The new relocation count.
   */
  public set numRelocs(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.numRelocs, value, true);
  }

  /**
   * Size of the DOS header in 16-byte paragraphs.
   *
   * @returns {number} The header size in paragraphs.
   */
  public get sizeOfHeaderInParagraphs(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.sizeOfHeaderInParagraphs, true);
  }

  /**
   * Sets the size of the DOS header in 16-byte paragraphs.
   *
   * @param {number} value The new header size in paragraphs.
   */
  public set sizeOfHeaderInParagraphs(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.sizeOfHeaderInParagraphs, value, true);
  }

  /**
   * Minimum number of extra paragraphs required above the program segment.
   *
   * @returns {number} The minimum extra paragraph count.
   */
  public get numMinExtraParagraphs(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.numMinExtraParagraphs, true);
  }

  /**
   * Sets the minimum number of extra paragraphs required above the program segment.
   *
   * @param {number} value The new minimum extra paragraph count.
   */
  public set numMinExtraParagraphs(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.numMinExtraParagraphs, value, true);
  }

  /**
   * Maximum number of extra paragraphs desired above the program segment.
   *
   * @returns {number} The maximum extra paragraph count.
   */
  public get numMaxExtraParagraphs(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.numMaxExtraParagraphs, true);
  }

  /**
   * Sets the maximum number of extra paragraphs desired above the program segment.
   *
   * @param {number} value The new maximum extra paragraph count.
   */
  public set numMaxExtraParagraphs(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.numMaxExtraParagraphs, value, true);
  }

  /**
   * Initial (relative) value of the stack-segment register for the DOS stub.
   *
   * @returns {number} The SS register value.
   */
  public get ss(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.ss, true);
  }

  /**
   * Sets the initial value of the stack-segment register for the DOS stub.
   *
   * @param {number} value The new SS register value.
   */
  public set ss(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.ss, value, true);
  }

  /**
   * Initial value of the stack pointer (SP) for the DOS stub.
   *
   * @returns {number} The SP register value.
   */
  public get sp(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.sp, true);
  }

  /**
   * Sets the initial value of the stack pointer for the DOS stub.
   *
   * @param {number} value The new SP register value.
   */
  public set sp(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.sp, value, true);
  }

  /**
   * Checksum of the DOS stub; usually zero and not validated by modern loaders.
   *
   * @returns {number} The 16-bit checksum value.
   */
  public get checksum(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.checksum, true);
  }

  /**
   * Sets the checksum of the DOS stub.
   *
   * @param {number} value The new 16-bit checksum value.
   */
  public set checksum(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.checksum, value, true);
  }

  /**
   * Initial value of the instruction pointer (IP) for the DOS stub.
   *
   * @returns {number} The IP register value.
   */
  public get ip(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.ip, true);
  }

  /**
   * Sets the initial value of the instruction pointer for the DOS stub.
   *
   * @param {number} value The new IP register value.
   */
  public set ip(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.ip, value, true);
  }

  /**
   * Initial (relative) value of the code-segment register for the DOS stub.
   *
   * @returns {number} The CS register value.
   */
  public get cs(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.cs, true);
  }

  /**
   * Sets the initial value of the code-segment register for the DOS stub.
   *
   * @param {number} value The new CS register value.
   */
  public set cs(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.cs, value, true);
  }

  /**
   * File offset of the DOS relocation table.
   *
   * @returns {number} The byte offset of the relocation table.
   */
  public get relocTableOffset(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.relocTableOffset, true);
  }

  /**
   * Sets the file offset of the DOS relocation table.
   *
   * @param {number} value The new byte offset of the relocation table.
   */
  public set relocTableOffset(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.relocTableOffset, value, true);
  }

  /**
   * Overlay number; zero for the main program.
   *
   * @returns {number} The overlay number.
   */
  public get overlayNumber(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.overlayNumber, true);
  }

  /**
   * Sets the overlay number.
   *
   * @param {number} value The new overlay number.
   */
  public set overlayNumber(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.overlayNumber, value, true);
  }

  /**
   * OEM identifier for the value in {@linkcode oemInfo}.
   *
   * @returns {number} The OEM identifier.
   */
  public get oemId(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.oemId, true);
  }

  /**
   * Sets the OEM identifier.
   *
   * @param {number} value The new OEM identifier.
   */
  public set oemId(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.oemId, value, true);
  }

  /**
   * OEM-specific information; interpretation depends on {@linkcode oemId}.
   *
   * @returns {number} The OEM-specific value.
   */
  public get oemInfo(): number {
    return this.view.getUint16(DOS_HDR_OFFSETS.oemInfo, true);
  }

  /**
   * Sets the OEM-specific information value.
   *
   * @param {number} value The new OEM-specific value.
   */
  public set oemInfo(value: number) {
    this.view.setUint16(DOS_HDR_OFFSETS.oemInfo, value, true);
  }

  /**
   * File offset of the PE signature (`"PE\0\0"`) and NT headers that follow
   * the DOS stub. Corresponds to the `e_lfanew` field in the Win32 SDK.
   *
   * @returns {number} The byte offset of the NT headers.
   */
  public get nextHdrOffset(): number {
    return this.view.getUint32(DOS_HDR_OFFSETS.nextHdrOffset, true);
  }

  /**
   * Sets the file offset of the PE signature and NT headers.
   *
   * @param {number} value The new byte offset of the NT headers.
   */
  public set nextHdrOffset(value: number) {
    this.view.setUint32(DOS_HDR_OFFSETS.nextHdrOffset, value, true);
  }
}
