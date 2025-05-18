/*
  Warnings:

  - You are about to drop the column `skillId` on the `Transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_skillId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "skillId",
ADD COLUMN     "recieverSkillId" INTEGER,
ADD COLUMN     "senderSkillId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_senderSkillId_fkey" FOREIGN KEY ("senderSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_recieverSkillId_fkey" FOREIGN KEY ("recieverSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
