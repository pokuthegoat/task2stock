-- Drop obsolete custom Phantom challenge and cookie session tables.
-- User.email and User.passwordHash columns are preserved.

DROP TABLE IF EXISTS "WalletAuthChallenge";
DROP TABLE IF EXISTS "AuthSession";
