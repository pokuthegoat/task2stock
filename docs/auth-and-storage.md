# Auth and storage setup

## Contact

`/contact` opens the visitor’s email client. The recipient is:

`task2stock@gmail.com`

Override only if needed:

```
NEXT_PUBLIC_CONTACT_EMAIL=task2stock@gmail.com
```

## Authentication

Task2Stock authenticates with Google OAuth and email/password. Both methods create the same `t2s_session` cookie against the `AuthSession` table.

Required Google environment variables:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`GOOGLE_CLIENT_SECRET` is server-only. Do not prefix it with `NEXT_PUBLIC_`.

Google OAuth callback path implemented by the app:

```
/api/auth/google/callback
```

Local callback URL:

```
http://localhost:3000/api/auth/google/callback
```

Production callback URL:

```
https://task2stock.vercel.app/api/auth/google/callback
```

Add both as authorized redirect URIs in Google Cloud. Add `http://localhost:3000` and `https://task2stock.vercel.app` as authorized JavaScript origins.

Passwords are hashed with scrypt. Google-only accounts have no local password.

## Production database (Vercel)

Local development uses `DATABASE_URL="file:./dev.db"`. That file database cannot persist user accounts on Vercel.

Required Vercel environment variables:

```
TURSO_DATABASE_URL=libsql://YOUR-DB-YOUR-ORG.turso.io
TURSO_AUTH_TOKEN=YOUR-TURSO-TOKEN
DATABASE_URL=file:./dev.db
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`DATABASE_URL` stays as the local SQLite placeholder so Prisma can resolve the schema. Runtime queries on Vercel go through Turso when the two `TURSO_*` variables are set.

Apply existing `prisma/migrations` to the Turso database before production signup. Catalog reads can still use fixtures (`DATA_SOURCE` unset). Auth needs the migrated `User` and `AuthSession` tables.

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
