-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutDate" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" INTEGER;
