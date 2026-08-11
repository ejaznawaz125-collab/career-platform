import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import test from "node:test";

import { RESUME_MIME_TYPES } from "./resume";
import { validateManagedResume } from "./resume-file-validation";

const USER_ID = "validation-user";

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(
  entries: Array<{ name: string; contents: Buffer; compress?: boolean }>,
): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const compressed = entry.compress ? deflateRawSync(entry.contents) : entry.contents;
    const method = entry.compress ? 8 : 0;
    const checksum = crc32(entry.contents);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(entry.contents.length, 22);
    localHeader.writeUInt16LE(name.length, 26);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(entry.contents.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(localOffset, 42);

    localParts.push(localHeader, name, compressed);
    centralParts.push(centralHeader, name);
    localOffset += localHeader.length + name.length + compressed.length;
  }

  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, central, end]);
}

function createPdf(): Buffer {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>",
  ];
  let body = "%PDF-1.7\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += `startxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, "ascii");
}

const contentTypesXml = Buffer.from(
  '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
);
const documentXml = Buffer.from(
  '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/></w:body></w:document>',
);

function validDocx(extra: Array<{ name: string; contents: Buffer; compress?: boolean }> = []) {
  return createZip([
    { name: "[Content_Types].xml", contents: contentTypesXml, compress: true },
    { name: "word/document.xml", contents: documentXml, compress: true },
    ...extra,
  ]);
}

function validatePdf(buffer: Buffer) {
  return validateManagedResume({
    buffer,
    pathname: `resumes/${USER_ID}/00000000-0000-0000-0000-000000000001.pdf`,
    userId: USER_ID,
    originalName: "resume.pdf",
    mimeType: RESUME_MIME_TYPES.pdf,
  });
}

function validateDocx(buffer: Buffer) {
  return validateManagedResume({
    buffer,
    pathname: `resumes/${USER_ID}/00000000-0000-0000-0000-000000000002.docx`,
    userId: USER_ID,
    originalName: "resume.docx",
    mimeType: RESUME_MIME_TYPES.docx,
  });
}

test("valid PDF is accepted", async () => {
  assert.equal(typeof globalThis.DOMMatrix, "undefined");
  assert.equal(typeof globalThis.ImageData, "undefined");
  assert.equal(typeof globalThis.Path2D, "undefined");
  const result = await validatePdf(createPdf());
  assert.equal(result.extension, "pdf");
  assert.match(result.contentHash, /^[a-f0-9]{64}$/);
});

test("truncated PDF is rejected", async () => {
  const pdf = createPdf();
  await assert.rejects(validatePdf(pdf.subarray(0, pdf.length - 10)));
});

test("fake PDF markers are rejected by the decoder", async () => {
  await assert.rejects(validatePdf(Buffer.from("%PDF-1.7\nnot a pdf\n%%EOF")));
});

test("encrypted PDF marker is rejected", async () => {
  const pdf = Buffer.concat([createPdf().subarray(0, -6), Buffer.from("/Encrypt\n%%EOF\n")]);
  await assert.rejects(validatePdf(pdf), /ENCRYPTED_PDF/);
});

test("valid DOCX is accepted", async () => {
  const result = await validateDocx(validDocx());
  assert.equal(result.extension, "docx");
});

test("malformed ZIP is rejected", async () => {
  await assert.rejects(validateDocx(Buffer.from("PK\u0003\u0004broken")));
});

test("DOCX missing a required OOXML entry is rejected", async () => {
  await assert.rejects(
    validateDocx(createZip([{ name: "[Content_Types].xml", contents: contentTypesXml }])),
  );
});

test("DOCX with malformed XML is rejected", async () => {
  const invalid = createZip([
    { name: "[Content_Types].xml", contents: contentTypesXml },
    { name: "word/document.xml", contents: Buffer.from("<w:document><broken></w:document>") },
  ]);
  await assert.rejects(validateDocx(invalid));
});

test("macro-enabled DOCX is rejected", async () => {
  await assert.rejects(
    validateDocx(validDocx([{ name: "word/vbaProject.bin", contents: Buffer.from("macro") }])),
    /UNSAFE_DOCX/,
  );
});

test("excessive DOCX expansion is rejected", async () => {
  const expansion = Buffer.alloc(1024 * 1024 + 1, 65);
  await assert.rejects(
    validateDocx(validDocx([{ name: "word/styles.xml", contents: expansion, compress: true }])),
    /DOCX_COMPRESSION_RATIO/,
  );
});
