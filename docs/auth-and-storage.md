# Auth and storage setup

## Contact

`/contact` opens the visitor’s email client. The recipient is:

`task2stock@gmail.com`

Override only if needed:

```
NEXT_PUBLIC_CONTACT_EMAIL=task2stock@gmail.com
```

## Google OAuth

Email/password stays the default. Google is optional.

1. Create an OAuth client in Google Cloud Console (Web application).
2. Add the authorized redirect URI:

```
http://localhost:3000/auth/google/callback
```

For production, add:

```
https://YOUR_DOMAIN/auth/google/callback
```

3. Set these in `.env` (never commit secrets):

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_URL=http://localhost:3000
```

`APP_URL` must match the origin used in the Google redirect URI.

If either Google variable is missing, the app does not crash. The button stays “Coming soon” and email/password still works.

Successful Google sign-in finds or creates a User by email, then uses the existing session cookie. Access tokens are not stored.

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
