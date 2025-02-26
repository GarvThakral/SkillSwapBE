-- AlterTable
ALTER TABLE "teachRequest" ADD COLUMN     "serviceId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "tradeRequest" ADD COLUMN     "serviceId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "teachRequest" ADD CONSTRAINT "teachRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tradeRequest" ADD CONSTRAINT "tradeRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
