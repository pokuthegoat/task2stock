-- Privy DID for Login with Privy. walletAddress already exists for the Privy wallet.
ALTER TABLE "User" ADD COLUMN "privyDid" TEXT;
CREATE UNIQUE INDEX "User_privyDid_key" ON "User"("privyDid");
