export const FILE_HEADER_SIZE = 0x14;

export const NT_HEADERS_OFFSETS = {
  signature: 0x00,
  fileHdr: 0x04,
  optionalHdr: 0x04 + FILE_HEADER_SIZE,
} as const;

export const COFF_OPTIONAL_HDR_OFFSETS = {
  magic: 0x00,
  linkerVersion: 0x02,
  sizeofCode: 0x04,
  sizeofInitData: 0x08,
  sizeofUninitData: 0x0C,
  entryPoint: 0x10,
  baseOfCode: 0x14,
} as const;

export const COFF_SECTION_HDR_OFFSETS = {
  name: 0x00,
  physicalAddress: 0x08,
  virtualSize: 0x08,
  virtualAddress: 0x0C,
  sizeRawData: 0x10,
  ptrRawData: 0x14,
  ptrRelocs: 0x18,
  ptrLineNumbers: 0x1C,
  numRelocs: 0x20,
  numLineNumbers: 0x22,
  characteristics: 0x24,
} as const;

/**
 * Offsets are relative to the start of the PE32/PE32+ specific fields,
 * shifted by 0x18 bytes to account for the common Optional Header members
 * (Magic, LinkerVersion, SizeOfCode, etc.) that precede them.
 */
export const BASE_OPTIONAL_HDR_OFFSETS = {
  linkerVersion: 0x02,
  sectionAlignment: 0x08,
  fileAlignment: 0x0C,
  osVersion: 0x10,
  imgVersion: 0x14,
  subsystemVersion: 0x18,
  win32VersionValue: 0x1C,
  sizeOfImage: 0x20,
  sizeOfHeaders: 0x24,
  checksum: 0x28,
  subsystem: 0x2C,
  characteristics: 0x2E,
} as const;

export const OPTIONAL_HDR64_OFFSETS = {
  imageBase: 0x00,
  sizeOfStackReserve: 0x30,
  sizeOfStackCommit: 0x38,
  sizeOfHeapReserve: 0x40,
  sizeOfHeapCommit: 0x48,
  ldrFlags: 0x50,
  numDataDirectories: 0x54,
} as const;

export const OPTIONAL_HDR32_OFFSETS = {
  baseOfData: 0x00,
  imageBase: 0x04,
  sizeOfStackReserve: 0x30,
  sizeOfStackCommit: 0x34,
  sizeOfHeapReserve: 0x38,
  sizeOfHeapCommit: 0x3C,
  ldrFlags: 0x40,
  numDataDirectories: 0x44,
} as const;

export const DOS_HDR_OFFSETS = {
  magic: 0x00,
  numBytesLastPage: 0x02,
  numPages: 0x04,
  numRelocs: 0x06,
  sizeOfHeaderInParagraphs: 0x08,
  numMinExtraParagraphs: 0x0A,
  numMaxExtraParagraphs: 0x0C,
  ss: 0x0E,
  sp: 0x10,
  checksum: 0x12,
  ip: 0x14,
  cs: 0x16,
  relocTableOffset: 0x18,
  overlayNumber: 0x1A,
  oemId: 0x24,
  oemInfo: 0x26,
  nextHdrOffset: 0x3C,
} as const;

export const DATA_DIRECTORY_OFFSETS = {
  rva: 0x0,
  size: 0x4,
} as const;

export const FILE_HEADER_OFFSETS = {
  machine: 0x00,
  numSections: 0x02,
  timeDateStamp: 0x04,
  ptrToSymbols: 0x08,
  numSymbols: 0x0C,
  sizeOptionalHeader: 0x10,
} as const;

export const DELAY_LOAD_DIR_OFFSETS = {
  attributes: 0x00,
  dllNameRva: 0x04,
  moduleHandleRva: 0x08,
  importAddressTableRva: 0x0C,
  importNameTableRva: 0x10,
  boundImportAddressTableRva: 0x14,
  unloadInformationTableRva: 0x18,
  timeDateStamp: 0x1C,
} as const;

export const EXPORT_DIR_OFFSETS = {
  characteristics: 0x00,
  timeDateStamp: 0x04,
  version: 0x08,
  name: 0x0C,
  base: 0x10,
  numFunctions: 0x14,
  numNames: 0x18,
  rvaFunctions: 0x1C,
  rvaNames: 0x20,
  rvaNameOrdinals: 0x24,
} as const;

export const BOUNDED_FORWARDER_REF_OFFSETS = {
  timeDateStamp: 0x00,
  offsetModuleName: 0x04,
} as const;

export const BOUNDED_IMPORT_DESCRIPTOR_OFFSETS = {
  timeDateStamp: 0x00,
  offsetModuleName: 0x04,
  numModuleForwarderRefs: 0x06,
} as const;

export const IMPORT_DIR_OFFSETS = {
  characteristics: 0x00,
  rvaOriginalFirstThunk: 0x00,
  timeDateStamp: 0x04,
  forwarderChain: 0x08,
  rvaName: 0x0C,
  rvaFirstThunk: 0x10,
} as const;

export const RELOC_BLOCK_OFFSETS = {
  baseRva: 0x00,
  sizeBlock: 0x04,
} as const;

export const TLS_DIR64_OFFSETS = {
  addressRawDataStart: 0x00,
  addressRawDataEnd: 0x08,
  addressIndex: 0x10,
  addressCallbacks: 0x18,
  sizeZeroFill: 0x20,
} as const;

export const TLS_DIR32_OFFSETS = {
  addressRawDataStart: 0x00,
  addressRawDataEnd: 0x04,
  addressIndex: 0x08,
  addressCallbacks: 0x0C,
  sizeZeroFill: 0x10,
} as const;
