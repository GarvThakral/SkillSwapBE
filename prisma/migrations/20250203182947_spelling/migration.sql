/*
  Warnings:

  - You are about to drop the column `senderTokens` on the `tradeRequest` table. All the data in the column will be lost.
  - Added the required column `senderToken` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tradeRequest" DROP COLUMN "senderTokens",
ADD COLUMN     "senderToken" INTEGER NOT NULL;
