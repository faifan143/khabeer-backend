-- CreateTable
CREATE TABLE "LocationTracking" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "accuracy" DECIMAL(5,2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LocationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "orderId" INTEGER,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationTracking_orderId_idx" ON "LocationTracking"("orderId");

-- CreateIndex
CREATE INDEX "LocationTracking_providerId_idx" ON "LocationTracking"("providerId");

-- CreateIndex
CREATE INDEX "LocationTracking_timestamp_idx" ON "LocationTracking"("timestamp");

-- CreateIndex
CREATE INDEX "LocationTracking_isActive_idx" ON "LocationTracking"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveConnection_socketId_key" ON "ActiveConnection"("socketId");

-- CreateIndex
CREATE INDEX "ActiveConnection_userId_idx" ON "ActiveConnection"("userId");

-- CreateIndex
CREATE INDEX "ActiveConnection_userType_idx" ON "ActiveConnection"("userType");

-- CreateIndex
CREATE INDEX "ActiveConnection_orderId_idx" ON "ActiveConnection"("orderId");

-- CreateIndex
CREATE INDEX "ActiveConnection_socketId_idx" ON "ActiveConnection"("socketId");

-- CreateIndex
CREATE INDEX "ActiveConnection_lastActivity_idx" ON "ActiveConnection"("lastActivity");

-- AddForeignKey
ALTER TABLE "LocationTracking" ADD CONSTRAINT "LocationTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationTracking" ADD CONSTRAINT "LocationTracking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveConnection" ADD CONSTRAINT "ActiveConnection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
