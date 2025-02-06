/*
  Warnings:

  - You are about to drop the column `amount` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `recieverAmount` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderAmount` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "amount",
ADD COLUMN     "recieverAmount" INTEGER NOT NULL,
ADD COLUMN     "senderAmount" INTEGER NOT NULL;
