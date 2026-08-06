-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0;
