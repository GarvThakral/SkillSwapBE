-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "serviceId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
