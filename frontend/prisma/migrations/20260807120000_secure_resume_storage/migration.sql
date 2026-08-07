-- All statements in this migration are PostgreSQL transaction-safe. Keep this
-- transaction wrapper so a failed constraint or index cannot leave a partial rollout.
BEGIN;

-- CreateEnum
CREATE TYPE "public"."ResumeUploadStatus" AS ENUM ('LEGACY', 'READY');

-- AlterTable
ALTER TABLE "public"."Resume"
ADD COLUMN "storagePath" TEXT,
ADD COLUMN "contentHash" TEXT,
ADD COLUMN "versionGroupId" TEXT,
ADD COLUMN "categoryTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "uploadStatus" "public"."ResumeUploadStatus" NOT NULL DEFAULT 'LEGACY';

ALTER TABLE "public"."Resume"
ALTER COLUMN "uploadStatus" SET DEFAULT 'READY';

-- CreateIndex
CREATE UNIQUE INDEX "Resume_storagePath_key" ON "public"."Resume"("storagePath");
CREATE UNIQUE INDEX "Resume_profileId_contentHash_key" ON "public"."Resume"("profileId", "contentHash");
CREATE UNIQUE INDEX "Resume_profileId_versionGroupId_version_key" ON "public"."Resume"("profileId", "versionGroupId", "version");
CREATE INDEX "Resume_profileId_idx" ON "public"."Resume"("profileId");
CREATE INDEX "Resume_profileId_versionGroupId_idx" ON "public"."Resume"("profileId", "versionGroupId");

-- Enforce one default resume per candidate profile while preserving nullable legacy data.
-- Deterministic reconciliation: retain the default with the newest "updatedAt",
-- then newest "createdAt", then lexicographically greatest "id" as the final tie-breaker.
-- No resume rows are deleted.
WITH ranked_defaults AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "profileId"
            ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
        ) AS default_rank
    FROM "public"."Resume"
    WHERE "isDefault" = true
)
UPDATE "public"."Resume" AS resume
SET "isDefault" = false
FROM ranked_defaults
WHERE resume."id" = ranked_defaults."id"
  AND ranked_defaults.default_rank > 1;

-- Prisma cannot represent partial indexes in schema.prisma. This database-level
-- invariant must be preserved explicitly by future migrations.
CREATE UNIQUE INDEX "Resume_one_default_per_profile"
ON "public"."Resume"("profileId")
WHERE "isDefault" = true;

-- CreateTable
CREATE TABLE "public"."ResumeUploadIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeUploadIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResumeUploadIntent_pathname_key" ON "public"."ResumeUploadIntent"("pathname");
CREATE INDEX "ResumeUploadIntent_userId_expiresAt_idx" ON "public"."ResumeUploadIntent"("userId", "expiresAt");
CREATE INDEX "ResumeUploadIntent_profileId_expiresAt_idx" ON "public"."ResumeUploadIntent"("profileId", "expiresAt");

ALTER TABLE "public"."ResumeUploadIntent" ADD CONSTRAINT "ResumeUploadIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ResumeUploadIntent" ADD CONSTRAINT "ResumeUploadIntent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
