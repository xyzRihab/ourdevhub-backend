-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "embedding" vector(1536);
