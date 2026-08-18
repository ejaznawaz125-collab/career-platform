-- CreateIndex
CREATE INDEX "Application_resumeId_idx" ON "public"."Application"("resumeId");

-- AddForeignKey
ALTER TABLE "public"."Application"
ADD CONSTRAINT "Application_resumeId_fkey"
FOREIGN KEY ("resumeId") REFERENCES "public"."Resume"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
