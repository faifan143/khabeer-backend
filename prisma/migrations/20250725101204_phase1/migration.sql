/*
  Warnings:

  - You are about to drop the column `price` on the `Offer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `offerPrice` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - The required column `bookingId` was added to the `Order` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `commissionAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "paymentDate" DROP NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "price",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "offerPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "commissionAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "locationDetails" TEXT,
ADD COLUMN     "providerAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "providerLocation" JSONB,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" JSONB;

-- AlterTable
ALTER TABLE "ProviderJoinRequest" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ProviderRating" ADD COLUMN     "orderId" INTEGER;

-- AlterTable
ALTER TABLE "ProviderService" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProviderVerification" (
    "id" TEXT NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "documents" TEXT[],
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderVerification_providerId_key" ON "ProviderVerification"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_bookingId_key" ON "Order"("bookingId");

-- AddForeignKey
ALTER TABLE "ProviderVerification" ADD CONSTRAINT "ProviderVerification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
