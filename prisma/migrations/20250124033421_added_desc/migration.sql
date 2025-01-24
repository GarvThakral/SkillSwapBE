/*
  Warnings:

  - Added the required column `description` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingDays` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teachRequest" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "workingDays" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "tradeRequest" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "workingDays" TEXT NOT NULL;
