import { BaseFormat } from "../../_internal.ts";
import { RELOC_BLOCK_OFFSETS } from "../../_offsets.ts";

/**
 * Base-relocation types stored in the high 4 bits of each
 * {@linkcode RelocEntry} value.
 */
export const enum RelocType {
  BasedAbsolute = 0,
  BasedHigh = 1,
  BasedLow = 2,
  BasedHighLow = 3,
  BasedHighAdj = 4,
  BasedIa64Imm64 = 9,
  BasedDir64 = 10,
}

/**
 * A single 2-byte entry within a {@linkcode RelocBlock}, encoding both the
 * relocation type and the page offset of the location to be fixed up.
 */
export class RelocEntry extends BaseFormat {
  public static override readonly SIZE: number = 2;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this entry begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, RelocEntry.SIZE);
  }

  /**
   * Raw 16-bit entry value containing both the type (high 4 bits) and the
   * page offset (low 12 bits).
   *
   * @returns {number} The packed 16-bit value.
   */
  public get value(): number {
    return this.view.getUint16(0, true);
  }

  /**
   * Sets the raw 16-bit entry value.
   *
   * @param {number} val The new packed 16-bit value.
   */
  public set value(val: number) {
    this.view.setUint16(0, val, true);
  }

  /**
   * Page offset within the relocation block's page (low 12 bits of
   * {@linkcode value}).
   *
   * @returns {number} The 12-bit page offset.
   */
  public get offset(): number {
    return this.value & 0x0fff;
  }

  /**
   * Sets the page offset stored in the low 12 bits of the entry, preserving
   * the relocation type in the high 4 bits.
   *
   * @param {number} val The new 12-bit page offset.
   */
  public set offset(val: number) {
    const v = (this.value & 0xf000) | (val & 0x0fff);

    this.value = v;
  }

  /**
   * Relocation type encoded in the high 4 bits of {@linkcode value}.
   *
   * @returns {RelocType} The relocation type.
   */
  public get type(): RelocType {
    return (this.value >> 12) as RelocType;
  }

  /**
   * Sets the relocation type in the high 4 bits, preserving the page offset
   * in the low 12 bits.
   *
   * @param {RelocType} val The new relocation type.
   */
  public set type(val: RelocType) {
    const value = (this.value & 0x0fff) | ((val & 0xf) << 12);

    this.value = value;
  }
}

/**
 * A base-relocation block (`IMAGE_BASE_RELOCATION`) consisting of a page RVA,
 * a total block size, and a variable-length array of {@linkcode RelocEntry}
 * values that immediately follow in the buffer.
 */
export class RelocBlock extends BaseFormat {
  public static override readonly SIZE: number = 12;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where this block begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, RelocBlock.SIZE);
  }

  /**
   * RVA of the 4 KB page to which all offsets in this block are relative.
   *
   * @returns {number} The page RVA.
   */
  public get baseRva(): number {
    return this.view.getUint32(RELOC_BLOCK_OFFSETS.baseRva, true);
  }

  /**
   * Sets the base page RVA for this relocation block.
   *
   * @param {number} val The new page RVA.
   */
  public set baseRva(val: number) {
    this.view.setUint32(RELOC_BLOCK_OFFSETS.baseRva, val, true);
  }

  /**
   * Total byte size of this block, including the 8-byte header and all
   * relocation entries.
   *
   * @returns {number} The block size in bytes.
   */
  public get sizeBlock(): number {
    return this.view.getUint32(RELOC_BLOCK_OFFSETS.sizeBlock, true);
  }

  /**
   * Sets the total byte size of this relocation block.
   *
   * @param {number} val The new block size in bytes.
   */
  public set sizeBlock(val: number) {
    this.view.setUint32(RELOC_BLOCK_OFFSETS.sizeBlock, val, true);
  }

  /**
   * Number of {@linkcode RelocEntry} records in this block, derived from
   * {@linkcode sizeBlock}.
   *
   * @returns {number} The entry count.
   */
  public get numEntries(): number {
    const entriesSize = this.sizeBlock - RelocBlock.SIZE;
    return entriesSize / RelocEntry.SIZE;
  }

  /**
   * Returns the {@linkcode RelocEntry} at the given index within this block.
   *
   * @param {number} index Zero-based index of the entry to retrieve.
   * @returns {RelocEntry} The relocation entry at `index`.
   */
  public entry(index: number): RelocEntry {
    const offset = this.view.byteOffset +
      RelocBlock.SIZE +
      index * RelocEntry.SIZE;

    return new RelocEntry(new Uint8Array(this.view.buffer), offset);
  }

  /**
   * Iterates over all {@linkcode RelocEntry} records in this block in order.
   *
   * @returns {IterableIterator<RelocEntry>} An iterator of relocation entries.
   */
  public *entries(): IterableIterator<RelocEntry> {
    for (let i = 0; i < this.numEntries; i++) {
      yield this.entry(i);
    }
  }

  /**
   * Returns the next {@linkcode RelocBlock} that immediately follows this one
   * in the buffer.
   *
   * @returns {RelocBlock} The next relocation block.
   */
  public next(): RelocBlock {
    const nextOffset = this.view.byteOffset + this.sizeBlock;

    return new RelocBlock(new Uint8Array(this.view.buffer), nextOffset);
  }
}

/**
 * A pair of a {@linkcode RelocBlock} and one of its {@linkcode RelocEntry}
 * values, yielded by {@linkcode RelocDirectory.walk}.
 */
export interface RelocWalkItem {
  /** The block that contains this entry. */
  block: RelocBlock;
  /** The individual relocation entry. */
  entry: RelocEntry;
}

/**
 * The PE base-relocation directory, providing iteration over all
 * {@linkcode RelocBlock} records and their {@linkcode RelocEntry} values.
 */
export class RelocDirectory extends BaseFormat {
  public static override readonly SIZE: number = RelocBlock.SIZE;

  /**
   * @param {Uint8Array} data The raw image buffer.
   * @param {number} offset Byte offset within `data` where the directory begins.
   */
  public constructor(data: Uint8Array, offset: number) {
    super(data, offset, RelocDirectory.SIZE);
  }

  /**
   * The first {@linkcode RelocBlock} in the relocation directory.
   *
   * @returns {RelocBlock} The first relocation block.
   */
  public get firstBlock(): RelocBlock {
    return new RelocBlock(
      new Uint8Array(this.view.buffer),
      this.view.byteOffset,
    );
  }

  /**
   * Iterates over all {@linkcode RelocBlock} records in the directory,
   * stopping when a block with a zero {@linkcode RelocBlock.sizeBlock} is
   * encountered.
   *
   * @returns {IterableIterator<RelocBlock>} An iterator of relocation blocks.
   */
  public *blocks(): IterableIterator<RelocBlock> {
    let block = this.firstBlock;

    while (block.sizeBlock > 0) {
      yield block;
      block = block.next();
    }
  }

  /**
   * Iterates over every {@linkcode RelocEntry} across all blocks in the
   * directory.
   *
   * @returns {IterableIterator<RelocEntry>} An iterator of all relocation entries.
   */
  public *entries(): IterableIterator<RelocEntry> {
    for (const block of this.blocks()) {
      yield* block.entries();
    }
  }

  /**
   * Iterates over every {@linkcode RelocEntry} in the directory, yielding
   * both the containing block and the entry as a {@linkcode RelocWalkItem}.
   *
   * @returns {IterableIterator<RelocWalkItem>} An iterator of block–entry pairs.
   */
  public *walk(): IterableIterator<RelocWalkItem> {
    for (const block of this.blocks()) {
      for (const entry of block.entries()) {
        yield { block, entry };
      }
    }
  }
}
