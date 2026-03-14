export const LEN_SHORT_STR = 8;

export abstract class BaseFormat {
  public static readonly SIZE: number;

  protected readonly view: DataView;

  protected constructor(data: Uint8Array, offset: number, size: number) {
    this.view = createDataView(data, offset, size);
  }

  public get byteLength(): number {
    return this.view.byteLength;
  }
}

export abstract class BaseCharacteristics<Bits extends number = number>
  extends BaseFormat {
  public abstract get flags(): number;
  public abstract set flags(value: number);

  protected hasFlag(mask: number): boolean {
    return (this.flags & mask) !== 0;
  }

  protected isBitSet(bit: Bits): boolean {
    return (this.flags & (1 << bit)) !== 0;
  }

  protected setBit(bit: Bits, active: boolean): void {
    const mask = 1 << bit;

    this.flags = active ? (this.flags | mask) : (this.flags & ~mask);
  }
}

export function createDataView(
  bin: Uint8Array,
  offset?: number,
  length?: number,
): DataView;
export function createDataView(
  view: DataView,
  offset: number,
  length?: number,
): DataView;
export function createDataView(
  binOrView: Uint8Array | DataView,
  offset?: number,
  length?: number,
): DataView {
  offset ??= 0;

  const newOffset = binOrView.byteOffset + offset;
  const newLength = length ?? (binOrView.byteLength - offset);

  return new DataView(binOrView.buffer, newOffset, newLength);
}

const ASCII_DECODER = new TextDecoder("ascii");

export function readAsciiUntilNull(
  view: DataView,
  offset: number,
  max: number,
): string;
export function readAsciiUntilNull(
  data: Uint8Array,
  offset: number,
  max: number,
): string;
export function readAsciiUntilNull(
  viewOrData: DataView | Uint8Array,
  offset: number,
  max: number,
): string {
  const bytes = viewOrData instanceof DataView
    ? new Uint8Array(
      viewOrData.buffer,
      viewOrData.byteOffset + offset,
      max,
    )
    : viewOrData.subarray(offset, offset + max);

  let end = 0;
  while (end < max && bytes[end] !== 0) {
    ++end;
  }

  return ASCII_DECODER.decode(bytes.subarray(0, end));
}

export function readAscii(
  view: DataView,
  offset: number,
  length: number,
): string;
export function readAscii(
  data: Uint8Array,
  offset: number,
  length: number,
): string;
export function readAscii(
  viewOrData: DataView | Uint8Array,
  offset: number,
  length: number,
): string {
  const bytes = viewOrData instanceof DataView
    ? new Uint8Array(
      viewOrData.buffer,
      viewOrData.byteOffset + offset,
      length,
    )
    : viewOrData.subarray(offset, offset + length);

  return ASCII_DECODER.decode(bytes);
}

export function bigIntToInt(value: bigint | number): number {
  return typeof value === "number"
    ? value
    : (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER)
    ? Number(value)
    : 0;
}

export function bigIntToUint(value: bigint | number): number {
  if (typeof value === "number") {
    return value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : 0;
  }

  return value >= 0n && value <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(value)
    : 0;
}
