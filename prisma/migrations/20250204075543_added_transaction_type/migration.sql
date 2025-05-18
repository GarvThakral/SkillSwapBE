-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';
