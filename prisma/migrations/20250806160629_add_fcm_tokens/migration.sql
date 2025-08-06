-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB,
ADD COLUMN     "failureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notificationType" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "successCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "fcmToken" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
