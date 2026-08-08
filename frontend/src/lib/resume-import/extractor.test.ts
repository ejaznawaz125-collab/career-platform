import assert from "node:assert/strict";
import test from "node:test";
import { deflateRawSync } from "node:zlib";

import { RESUME_MIME_TYPES } from "../resume";
import { extractResumeBuffer } from "./extractor";

function crc32(buffer: Buffer) { let crc = 0xffffffff; for (const byte of buffer) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; } return (crc ^ 0xffffffff) >>> 0; }
function zip(entries: Array<[string, Buffer]>) {
  const local: Buffer[] = [], central: Buffer[] = []; let offset = 0;
  for (const [filename, contents] of entries) { const name = Buffer.from(filename); const compressed = deflateRawSync(contents); const sum = crc32(contents); const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50); lh.writeUInt16LE(20,4); lh.writeUInt16LE(8,8); lh.writeUInt32LE(sum,14); lh.writeUInt32LE(compressed.length,18); lh.writeUInt32LE(contents.length,22); lh.writeUInt16LE(name.length,26); const ch=Buffer.alloc(46); ch.writeUInt32LE(0x02014b50); ch.writeUInt16LE(20,4); ch.writeUInt16LE(20,6); ch.writeUInt16LE(8,10); ch.writeUInt32LE(sum,16); ch.writeUInt32LE(compressed.length,20); ch.writeUInt32LE(contents.length,24); ch.writeUInt16LE(name.length,28); ch.writeUInt32LE(offset,42); local.push(lh,name,compressed); central.push(ch,name); offset += lh.length+name.length+compressed.length; }
  const directory=Buffer.concat(central), end=Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10); end.writeUInt32LE(directory.length,12); end.writeUInt32LE(offset,16); return Buffer.concat([...local,directory,end]);
}
function pdf(text: string) {
  const escaped=text.replace(/[()\\]/g,"\\$&"); const stream=`BT /F1 12 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`]; let body="%PDF-1.7\n", offsets=[0]; objects.forEach((object,index)=>{offsets.push(Buffer.byteLength(body)); body+=`${index+1} 0 obj\n${object}\nendobj\n`;}); const xref=Buffer.byteLength(body); body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map((value)=>`${String(value).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`; return Buffer.from(body,"ascii");
}
const path = (extension: "pdf"|"docx") => ({ pathname: `resumes/test-user/00000000-0000-0000-0000-000000000001.${extension}`, userId: "test-user", originalName: `resume.${extension}`, mimeType: RESUME_MIME_TYPES[extension] });

test("PDF text is extracted without rendering", async () => { const result=await extractResumeBuffer(pdf("Aisha Khan Software Engineer TypeScript React Node PostgreSQL cloud architecture product delivery experience@example.com"),path("pdf")); assert.equal(result.status,"READY"); if(result.status==="READY") assert.match(result.text,/Aisha Khan/); });
test("low-text PDF returns the image-only state", async () => { const result=await extractResumeBuffer(pdf("Short"),path("pdf")); assert.deepEqual(result,{status:"IMAGE_ONLY_OR_LOW_TEXT"}); });
test("DOCX raw text is extracted", async () => {
  const content=Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  const document=Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Aisha Khan Software Engineer with TypeScript and React experience across production platforms.</w:t></w:r></w:p></w:body></w:document>');
  const result=await extractResumeBuffer(zip([["[Content_Types].xml",content],["word/document.xml",document]]),path("docx")); assert.equal(result.status,"READY"); if(result.status==="READY") assert.match(result.text,/TypeScript/);
});
