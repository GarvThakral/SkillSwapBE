/*
  Warnings:

  - You are about to drop the column `skillId` on the `tradeRequest` table. All the data in the column will be lost.
  - Added the required column `receiverSkillId` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderSkillId` to the `tradeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tradeRequest" DROP CONSTRAINT "tradeRequest_skillId_fkey";

-- AlterTable
ALTER TABLE "tradeRequest" DROP COLUMN "skillId",
ADD COLUMN     "receiverSkillId" INTEGER NOT NULL,
ADD COLUMN     "senderSkillId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "tradeRequest" ADD CONSTRAINT "tradeRequest_senderSkillId_fkey" FOREIGN KEY ("senderSkillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tradeRequest" ADD CONSTRAINT "tradeRequest_receiverSkillId_fkey" FOREIGN KEY ("receiverSkillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
