/**
 * A system-independent library for parsing PE (Portable Executable) and
 * COFF (Common Object File Format) binary files.
 *
 * Supports both 32-bit (PE32) and 64-bit (PE32+) executables. The library
 * exposes a low-level, structured API that maps directly onto the on-disk
 * binary format, allowing callers to read and modify header fields without
 * serialization overhead.
 *
 * ## Quick start
 *
 * Load a PE file from disk and enumerate its exports:
 *
 * ```ts
 * import { loadPeImage } from "@neonbyte/pe";
 *
 * const pe = await loadPeImage("C:/Windows/System32/kernel32.dll");
 *
 * for (const exp of pe.collectExports()) {
 *   if (exp.name && exp.rva !== undefined) {
 *     console.log(`${exp.name} @ 0x${exp.rva.toString(16).toUpperCase()}`);
 *   }
 * }
 * ```
 *
 * ## Parsing imports
 *
 * ```ts
 * import { loadPeImage } from "@neonbyte/pe";
 *
 * const pe = await loadPeImage("C:/Windows/System32/ntdll.dll");
 * const imports = pe.parseImports();
 *
 * for (const [dll, funcs] of Object.entries(imports)) {
 *   console.log(`${dll} (${funcs.length} imports)`);
 * }
 * ```
 *
 * ## Loading from a raw buffer
 *
 * ```ts
 * import { loadPeImage } from "@neonbyte/pe";
 *
 * const data = await Deno.readFile("image.exe");
 * const pe = await loadPeImage(data);
 *
 * console.log("Machine:", pe.nt.fileHdr.machine);
 * console.log("Sections:", pe.nt.fileHdr.numSections);
 * ```
 *
 * ## Inspecting sections
 *
 * ```ts
 * import { loadPeImage } from "@neonbyte/pe";
 *
 * const pe = await loadPeImage("image.exe");
 *
 * for (const section of pe.getSections()) {
 *   console.log(section.name, "VA:", section.virtualAddress.toString(16));
 * }
 * ```
 *
 * @module
 */
export * from "./coff/file_header.ts";
export * from "./coff/optional_header.ts";
export * from "./coff/section_header.ts";
export * from "./coff/version.ts";

export * from "./nt/dir/delay_load.ts";
export * from "./nt/dir/exports.ts";
export * from "./nt/dir/iat.ts";
export * from "./nt/dir/imports.ts";
export * from "./nt/dir/relocs.ts";
export * from "./nt/dir/tls.ts";

export * from "./nt/data_directories.ts";
export * from "./nt/data_directory.ts";
export * from "./nt/dos_header.ts";
export * from "./nt/nt_headers.ts";
export * from "./nt/optional_header.ts";
export * from "./nt/pe_image.ts";

export { LEN_SHORT_STR } from "./_internal.ts";
