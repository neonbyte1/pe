# @neonbyte/pe

A system-independent TypeScript library for parsing **PE (Portable Executable)** and **COFF (Common Object File Format)** binary files, actually a port of my [zen](https://github.com/neonbyte1/zen) library.

## Installation

```ts
import { loadPeImage } from "jsr:@neonbyte/pe";
```

Or add it to your `deno.json`:

```json
{
  "imports": {
    "@neonbyte/pe": "jsr:@neonbyte/pe"
  }
}
```

## Quick Start

```ts
import { loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("C:/Windows/System32/kernel32.dll");

console.log("64-bit:", pe.nt.optionalHdr.is64Bit());
console.log("Entry point:", pe.entryPoint.toString(16));
console.log("Image base:", pe.imageBase.toString(16));
```

## Usage

### Enumerate Exports

```ts
import { loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("C:/Windows/System32/kernel32.dll");

for (const exp of pe.getExports()) {
  if (exp.name && exp.rva !== undefined) {
    console.log(`${exp.name} @ 0x${exp.rva.toString(16).toUpperCase()}`);
  } else if (exp.forward) {
    console.log(`${exp.name} -> ${exp.forward.library}.${exp.forward.function}`);
  }
}
```

### Enumerate Imports

```ts
import { loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("C:/Windows/System32/ntdll.dll");

for (const { module, functions } of pe.getImports()) {
  console.log(`${module} (${functions.length} imports)`);

  for (const fn of functions) {
    if ("name" in fn) {
      console.log(`  ${fn.name}`);
    } else {
      console.log(`  #${fn.ordinal}`);
    }
  }
}
```

### Enumerate Base Relocations

```ts
import { loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("image.dll");

for (const reloc of pe.getRelocations()) {
  console.log(`RVA: 0x${(reloc.baseRva + reloc.offset).toString(16)}, type: ${reloc.type}`);
}
```

### Inspect Sections

```ts
import { loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("image.exe");

for (const section of pe.getSections()) {
  console.log(
    section.name.padEnd(8),
    "VA:", section.virtualAddress.toString(16).padStart(8, "0"),
    "raw:", section.ptrRawData.toString(16).padStart(8, "0"),
  );
}
```

### Query Data Directories

```ts
import { DirectoryEntry, loadPeImage } from "@neonbyte/pe";

const pe = await loadPeImage("image.dll");

const tls = pe.directory(DirectoryEntry.TLS);
if (tls) {
  console.log("TLS directory RVA:", tls.rva.toString(16));
}
```

### Load from a Raw Buffer

```ts
import { loadPeImage } from "@neonbyte/pe";

const data = await Deno.readFile("image.exe");
const pe = await loadPeImage(data);

console.log("Machine:", pe.nt.fileHdr.machine);
console.log("Sections:", pe.nt.fileHdr.numSections);
```

## API Overview

### Factory

| Function | Description |
|---|---|
| `loadPeImage(path)` | Load a PE image from a file path |
| `loadPeImage(data)` | Load a PE image from a `Uint8Array` |

### `PeImage`

| Member | Type | Description |
|---|---|---|
| `data` | `Uint8Array` | Raw binary data of the entire image |
| `dos` | `DosHeader` | Parsed DOS (`MZ`) header |
| `nt` | `BaseNtHeaders` | Parsed NT headers (32-bit or 64-bit) |
| `directories` | `DataDirectories` | All sixteen PE data-directory entries |
| `entryPoint` | `number` | Entry-point RVA |
| `imageBase` | `bigint` | Preferred load address |
| `sizeOfImage` | `number` | Total in-memory image size |
| `sizeOfCode` | `number` | Combined size of all code sections |
| `sizeOfHeaders` | `number` | Combined size of all headers |
| `rawLimit` | `number` | Maximum valid raw file offset |
| `directory(id)` | `DataDirectory \| null` | Fetch a single data-directory entry by type |
| `getSections()` | `IterableIterator<SectionHeader>` | Iterate all section headers |
| `getExports()` | `IterableIterator<ExportInfo>` | Iterate export directory entries |
| `getImports()` | `IterableIterator<ModuleImports>` | Iterate import descriptors per DLL |
| `getRelocations()` | `IterableIterator<RelocInfo>` | Iterate base-relocation entries |
| `rvaToSection(rva)` | `SectionHeader \| null` | Find the section containing an RVA |
| `fileOffsetToSection(offset)` | `SectionHeader \| null` | Find the section containing a file offset |
| `resolveRva(rva, length?)` | `number` | Convert an RVA to a raw file offset |
| `resolveFileOffset(offset, length?)` | `number` | Convert a raw file offset to a virtual address |
| `resolveRaw(offset, length?)` | `number` | Validate a raw file offset against `rawLimit` |

### Key Types

| Type | Description |
|---|---|
| `ExportInfo` | A single exported symbol (name, RVA, or forwarded export) |
| `ForwardedExportInfo` | Forwarded export - target library and function |
| `ModuleImports` | One imported DLL with its resolved function list |
| `NamedImportInfo` | Import resolved by name |
| `OrdinalImportInfo` | Import resolved by ordinal |
| `RelocInfo` | A single base-relocation entry |
| `DirectoryEntry` | Enum of the 16 PE data-directory indices |

## License

The repository is [MIT](license.md) licensed.
