import { BaseFormat } from "../_internal.ts";
import { NT_HEADERS_OFFSETS } from "../_offsets.ts";
import { FileHeader } from "../coff/file_header.ts";
import type { BaseOptionalHeader } from "./optional_header.ts";

/** Four-byte PE signature (`0x4550`, ASCII `"PE\0\0"`) at the start of NT headers. */
export const IMAGE_NT_SIGNATURE = 0x4550;

/**
 * Abstract base for the NT headers structure that follows the DOS stub in a
 * PE file. Concrete subclasses are {@linkcode NtHeaders32} (PE32) and
 * {@linkcode NtHeaders64} (PE32+).
 */
export abstract class BaseNtHeaders extends BaseFormat {
  /** The COFF file header embedded at the start of the NT headers. */
  public readonly fileHdr: FileHeader;

  /** The optional header describing the image's load parameters and data directories. */
  public abstract readonly optionalHdr: BaseOptionalHeader;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where the NT headers begin.
   * @param {number} size Total byte size of the concrete NT headers variant.
   */
  protected constructor(
    data: Uint8Array,
    offset: number,
    size: number,
  ) {
    super(data, offset, size);

    this.fileHdr = new FileHeader(
      data,
      offset + NT_HEADERS_OFFSETS.fileHdr,
    );
  }

  /**
   * The four-byte PE signature - must equal {@linkcode IMAGE_NT_SIGNATURE}.
   *
   * @returns {number} The 32-bit signature value.
   */
  public get signature(): number {
    return this.view.getUint32(NT_HEADERS_OFFSETS.signature, true);
  }

  /**
   * Sets the four-byte PE signature.
   *
   * @param {number} value The new 32-bit signature value.
   */
  public set signature(value: number) {
    this.view.setUint32(NT_HEADERS_OFFSETS.signature, value, true);
  }

  /**
   * Returns `true` when {@linkcode signature} equals {@linkcode IMAGE_NT_SIGNATURE}.
   *
   * @returns {boolean} `true` if the PE signature is valid.
   */
  public isValid(): boolean {
    return this.signature === IMAGE_NT_SIGNATURE;
  }
}
