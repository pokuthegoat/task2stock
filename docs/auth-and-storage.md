# Auth and storage setup

## Contact

`/contact` opens the visitor’s email client. The recipient is:

`task2stock@gmail.com`

Override only if needed:

```
NEXT_PUBLIC_CONTACT_EMAIL=task2stock@gmail.com
```

## Phantom wallet authentication

`/login` and `/signup` use Phantom as the primary sign-in option. Email and password remain a fallback.

No API key or third-party auth provider is required. The server creates a one-time nonce, Phantom signs a Task2Stock message, and the server verifies the Ed25519 signature before creating the existing `t2s_session` cookie.

Wallet-only users are stored with `walletAddress` and do not receive a password or a synthetic email. Wallets are not linked to existing email/password accounts.

## Proof file storage

Proof files are not stored in SQLite. Metadata lives on `ProofSubmission`. Bytes go through `src/lib/storage/provider.ts`.

Local development (default):

```
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=.data/proofs
```

Production object storage:

```
STORAGE_DRIVER=s3
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
S3_FORCE_PATH_STYLE=true
```

`S3_ENDPOINT` and `S3_FORCE_PATH_STYLE` are for S3-compatible hosts (R2, MinIO). Leave them unset for AWS S3.

Owners can read their own files at `/api/proofs/[submissionId]`. Verification admins on `VERIFICATION_ADMIN_USER_IDS` can also read them. Upload does not verify proof.
