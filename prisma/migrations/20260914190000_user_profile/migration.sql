-- Profile fields and independent 14-day cooldown timestamps.
-- Existing rows stay intact: username remains null until setup,
-- and cooldown timestamps stay null so no one is locked without a real change.

ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "usernameChangedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "emailChangedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" DATETIME;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
