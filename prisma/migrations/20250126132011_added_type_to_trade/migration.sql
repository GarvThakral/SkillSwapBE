-- CreateEnum
CREATE TYPE "Type" AS ENUM ('TEACH', 'TRADE');

-- AlterTable
ALTER TABLE "teachRequest" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'TEACH';

-- AlterTable
ALTER TABLE "tradeRequest" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'TRADE';
