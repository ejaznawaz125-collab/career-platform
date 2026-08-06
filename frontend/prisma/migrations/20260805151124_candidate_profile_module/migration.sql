/*
  Warnings:

  - The `employmentType` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `CandidateProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CandidateSkill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CandidateLanguageLevel" AS ENUM ('BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'FLUENT', 'NATIVE');

-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY', 'APPRENTICESHIP', 'SELF_EMPLOYED');

-- AlterTable
ALTER TABLE "public"."CandidateProfile" ADD COLUMN     "availableImmediately" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completionPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentSalary" INTEGER,
ADD COLUMN     "experienceLevel" "public"."ExperienceLevel",
ADD COLUMN     "highestEducation" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredCity" TEXT,
ADD COLUMN     "preferredCountry" TEXT,
ADD COLUMN     "preferredJobType" "public"."JobType",
ADD COLUMN     "preferredWorkMode" "public"."WorkMode",
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."CandidateSkill" ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Education" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currentlyStudying" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Experience" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "industry" TEXT,
DROP COLUMN "employmentType",
ADD COLUMN     "employmentType" "public"."EmploymentType";

-- AlterTable
ALTER TABLE "public"."Resume" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "parsedData" JSONB,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."CandidateLanguage" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" "public"."CandidateLanguageLevel" NOT NULL,
    "isNative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortfolioProject" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectUrl" TEXT,
    "githubUrl" TEXT,
    "imageUrl" TEXT,
    "technologies" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_slug_key" ON "public"."CandidateProfile"("slug");

-- AddForeignKey
ALTER TABLE "public"."CandidateLanguage" ADD CONSTRAINT "CandidateLanguage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortfolioProject" ADD CONSTRAINT "PortfolioProject_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
