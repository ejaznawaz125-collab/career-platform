BEGIN;

CREATE TYPE "public"."ResumeParseStatus" AS ENUM ('PROCESSING', 'READY', 'LOW_TEXT', 'FAILED');

CREATE TABLE "public"."ResumeParse" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "extractorVersion" TEXT NOT NULL,
    "parserVersion" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "status" "public"."ResumeParseStatus" NOT NULL DEFAULT 'PROCESSING',
    "extractedData" JSONB,
    "diagnosticCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResumeParse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResumeParse_resumeId_contentHash_extractorVersion_parserVersion_schemaVersion_key"
ON "public"."ResumeParse"("resumeId", "contentHash", "extractorVersion", "parserVersion", "schemaVersion");

CREATE INDEX "ResumeParse_resumeId_createdAt_idx" ON "public"."ResumeParse"("resumeId", "createdAt");

ALTER TABLE "public"."ResumeParse"
ADD CONSTRAINT "ResumeParse_resumeId_fkey"
FOREIGN KEY ("resumeId") REFERENCES "public"."Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
