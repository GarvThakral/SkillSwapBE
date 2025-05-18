/*
  Warnings:

  - You are about to drop the column `tokens` on the `teachRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teachRequest" DROP COLUMN "tokens",
ADD COLUMN     "recieverToken" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "senderToken" INTEGER NOT NULL DEFAULT 50;
