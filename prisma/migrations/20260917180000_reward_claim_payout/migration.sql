-- AlterTable
ALTER TABLE "Reward" ADD COLUMN "ethAmount" TEXT NOT NULL DEFAULT '0.01';
ALTER TABLE "Reward" ADD COLUMN "payoutWalletAddress" TEXT;
ALTER TABLE "Reward" ADD COLUMN "claimedAt" DATETIME;
ALTER TABLE "Reward" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Reward" ADD COLUMN "txHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reward_submissionId_key" ON "Reward"("submissionId");

-- CreateIndex
CREATE INDEX "Reward_status_idx" ON "Reward"("status");
