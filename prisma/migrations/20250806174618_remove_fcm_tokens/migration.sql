/*
  Warnings:

  - You are about to drop the column `fcmToken` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `fcmToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "fcmToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fcmToken";
