-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('REGULAR', 'MEETING');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" DEFAULT 'REGULAR';
