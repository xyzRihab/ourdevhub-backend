/*
  Warnings:

  - You are about to drop the column `embedding` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `profileEmbedding` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileEmbedding";
