-- AlterTable
ALTER TABLE "ProofSubmission" ADD COLUMN "fileName" TEXT;
ALTER TABLE "ProofSubmission" ADD COLUMN "fileContentType" TEXT;
ALTER TABLE "ProofSubmission" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "ProofSubmission" ADD COLUMN "fileStorageKey" TEXT;
