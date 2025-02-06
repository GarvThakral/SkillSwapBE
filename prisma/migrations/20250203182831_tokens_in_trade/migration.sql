/*
  Warnings:

  - Added the required column `recieverToken` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderTokens` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tradeRequest" ADD COLUMN     "recieverToken" INTEGER NOT NULL,
ADD COLUMN     "senderTokens" INTEGER NOT NULL;
