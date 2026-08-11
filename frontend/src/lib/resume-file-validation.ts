import { createHash } from "node:crypto";

import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { Entry, ZipFile } from "yauzl";
import { fromBuffer } from "yauzl";

import {
  expectedResumeMimeType,
  getResumeExtension,
  isOwnedResumePath,
  RESUME_MAX_FILE_SIZE,
} from "@/lib/resume";

const MAX_PDF_PAGES = 100;
const PDF_PARSE_TIMEOUT_MS = 8_000;
const MAX_DOCX_ENTRIES = 2_000;
const MAX_DOCX_UNCOMPRESSED_SIZE = 50 * 1024 * 1024;
const MAX_DOCX_ENTRY_SIZE = 20 * 1024 * 1024;
const MAX_DOCX_COMPRESSION_RATIO = 100;

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < CRC_TABLE.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[index] = value >>> 0;
}

function calculateCrc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function validatePdf(buffer: Buffer): Promise<void> {
  const header = buffer.subarray(0, 8).toString("ascii");
  const trailer = buffer
    .subarray(Math.max(0, buffer.length - 2_048))
    .toString("latin1");

  if (!/^%PDF-1\.[0-7]/.test(header) || !trailer.includes("%%EOF")) {
    throw new Error("INVALID_PDF");
  }

  if (buffer.toString("latin1").includes("/Encrypt")) {
    throw new Error("ENCRYPTED_PDF");
  }

  const { EncryptedPDFError, PDFDocument } = await import("pdf-lib");

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const document = await Promise.race([
      PDFDocument.load(buffer, {
        capNumbers: true,
        ignoreEncryption: false,
        throwOnInvalidObject: true,
        updateMetadata: false,
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("PDF_VALIDATION_TIMEOUT")),
          PDF_PARSE_TIMEOUT_MS,
        );
      }),
    ]);

    const pages = document.getPages();
    if (pages.length < 1 || pages.length > MAX_PDF_PAGES) {
      throw new Error("INVALID_PDF_PAGE_COUNT");
    }

    for (const page of pages) {
      const { height, width } = page.getSize();
      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        throw new Error("INVALID_PDF_PAGE_SIZE");
      }
    }
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new Error("ENCRYPTED_PDF");
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function openZip(buffer: Buffer): Promise<ZipFile> {
  return new Promise((resolve, reject) => {
    fromBuffer(
      buffer,
      {
        autoClose: true,
        decodeStrings: true,
        lazyEntries: true,
        strictFileNames: true,
        validateEntrySizes: true,
      },
      (error, zipFile) => {
        if (error || !zipFile) reject(error ?? new Error("INVALID_DOCX"));
        else resolve(zipFile);
      },
    );
  });
}

function readEntry(zipFile: ZipFile, entry: Entry): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error || !stream) {
        reject(error ?? new Error("INVALID_DOCX_ENTRY"));
        return;
      }

      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > entry.uncompressedSize || size > MAX_DOCX_ENTRY_SIZE) {
          stream.destroy(new Error("DOCX_ENTRY_TOO_LARGE"));
          return;
        }
        chunks.push(chunk);
      });
      stream.once("error", reject);
      stream.once("end", () => {
        const contents = Buffer.concat(chunks);
        if (
          contents.length !== entry.uncompressedSize ||
          calculateCrc32(contents) !== (entry.crc32 >>> 0)
        ) {
          reject(new Error("DOCX_CRC_MISMATCH"));
          return;
        }
        resolve(contents);
      });
    });
  });
}

function decodeXml(buffer: Buffer): string {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.allocUnsafe(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      swapped[index - 2] = buffer[index + 1];
      swapped[index - 1] = buffer[index];
    }
    return swapped.toString("utf16le");
  }
  return buffer.toString("utf8");
}

function validateXml(buffer: Buffer, rootName: "Types" | "document"): void {
  const xml = decodeXml(buffer);
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || xml.includes("\uFFFD")) {
    throw new Error("UNSAFE_DOCX_XML");
  }

  const validation = XMLValidator.validate(xml, {
    allowBooleanAttributes: false,
  });
  if (validation !== true) throw new Error("INVALID_DOCX_XML");

  const parsed = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    parseTagValue: false,
    removeNSPrefix: true,
  }).parse(xml) as Record<string, unknown>;
  const root = parsed[rootName];
  if (!root || typeof root !== "object") throw new Error("INVALID_DOCX_XML_ROOT");

  if (rootName === "document" && !("body" in (root as Record<string, unknown>))) {
    throw new Error("INVALID_DOCX_DOCUMENT");
  }
}

async function validateDocx(buffer: Buffer): Promise<void> {
  const zipFile = await openZip(buffer);
  if (zipFile.entryCount < 1 || zipFile.entryCount > MAX_DOCX_ENTRIES) {
    zipFile.close();
    throw new Error("INVALID_DOCX_ENTRY_COUNT");
  }

  let totalUncompressed = 0;
  let contentTypes: Buffer | null = null;
  let documentXml: Buffer | null = null;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      zipFile.close();
      reject(error);
    };

    zipFile.once("error", fail);
    zipFile.once("end", () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    });
    zipFile.on("entry", (entry) => {
      void (async () => {
        const filename = entry.fileName.replace(/\\/g, "/");
        const lowerFilename = filename.toLowerCase();

        if (
          filename.startsWith("/") ||
          filename.split("/").includes("..") ||
          entry.generalPurposeBitFlag & 0x1 ||
          ![0, 8].includes(entry.compressionMethod) ||
          lowerFilename.includes("vbaproject.bin") ||
          lowerFilename.startsWith("word/activex/") ||
          lowerFilename.startsWith("word/embeddings/")
        ) {
          throw new Error("UNSAFE_DOCX");
        }

        totalUncompressed += entry.uncompressedSize;
        if (
          entry.uncompressedSize > MAX_DOCX_ENTRY_SIZE ||
          totalUncompressed > MAX_DOCX_UNCOMPRESSED_SIZE
        ) {
          throw new Error("DOCX_TOO_LARGE");
        }
        if (
          entry.uncompressedSize > 1024 * 1024 &&
          entry.compressedSize > 0 &&
          entry.uncompressedSize / entry.compressedSize > MAX_DOCX_COMPRESSION_RATIO
        ) {
          throw new Error("DOCX_COMPRESSION_RATIO");
        }

        if (!filename.endsWith("/")) {
          const contents = await readEntry(zipFile, entry);
          if (filename === "[Content_Types].xml") contentTypes = contents;
          if (filename === "word/document.xml") documentXml = contents;
        }
        zipFile.readEntry();
      })().catch(fail);
    });

    zipFile.readEntry();
  });

  if (!contentTypes || !documentXml) throw new Error("INVALID_DOCX");
  validateXml(contentTypes, "Types");
  validateXml(documentXml, "document");
}

export async function validateManagedResume(options: {
  buffer: Buffer;
  pathname: string;
  userId: string;
  originalName: string;
  mimeType: string;
}): Promise<{ contentHash: string; extension: "pdf" | "docx" }> {
  const { buffer, pathname, userId, originalName, mimeType } = options;

  if (buffer.length === 0 || buffer.length > RESUME_MAX_FILE_SIZE) {
    throw new Error("INVALID_RESUME_SIZE");
  }
  if (!isOwnedResumePath(pathname, userId)) throw new Error("INVALID_RESUME_PATH");

  const extension = getResumeExtension(originalName);
  const pathExtension = getResumeExtension(pathname);
  if (
    !extension ||
    extension !== pathExtension ||
    mimeType !== expectedResumeMimeType(extension)
  ) {
    throw new Error("INVALID_RESUME_TYPE");
  }

  if (extension === "pdf") await validatePdf(buffer);
  else await validateDocx(buffer);

  return {
    extension,
    contentHash: createHash("sha256").update(buffer).digest("hex"),
  };
}
