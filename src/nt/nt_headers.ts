import { NT_HEADERS_OFFSETS } from "../_offsets.ts";
import { FileHeader } from "../coff/file_header.ts";
import { BaseNtHeaders } from "./_base_nt_headers.ts";
import { OptionalHeader32, OptionalHeader64 } from "./optional_header.ts";

/**
 * NT headers for a 64-bit (PE32+) image. Contains a
 * {@linkcode OptionalHeader64} in the {@linkcode optionalHdr} property.
 */
export class NtHeaders64 extends BaseNtHeaders {
  public static override readonly SIZE: number = 4 + FileHeader.SIZE +
    OptionalHeader64.SIZE;

  /** The PE32+ optional header with 64-bit image base and address fields. */
  public readonly optionalHdr: OptionalHeader64;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where the NT headers begin.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, NtHeaders64.SIZE);

    this.optionalHdr = new OptionalHeader64(
      data,
      offset + NT_HEADERS_OFFSETS.optionalHdr,
    );
  }
}

/**
 * NT headers for a 32-bit (PE32) image. Contains a
 * {@linkcode OptionalHeader32} in the {@linkcode optionalHdr} property.
 */
export class NtHeaders32 extends BaseNtHeaders {
  public static override readonly SIZE: number = 4 + FileHeader.SIZE +
    OptionalHeader32.SIZE;

  /** The PE32 optional header with 32-bit image base and address fields. */
  public readonly optionalHdr: OptionalHeader32;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where the NT headers begin.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, NtHeaders32.SIZE);

    this.optionalHdr = new OptionalHeader32(
      data,
      offset + NT_HEADERS_OFFSETS.optionalHdr,
    );
  }
}
