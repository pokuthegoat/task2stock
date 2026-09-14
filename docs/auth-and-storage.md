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

## Proof and profile picture storage

Files are not stored in SQLite. Metadata lives on `ProofSubmission` / `User.avatarUrl`. Bytes go through two separate Vercel Blob stores.

Local development without proof Blob credentials writes proof files to:

```
STORAGE_LOCAL_DIR=.data/proofs
```

### Private proofs — `task2stock-proofs`

Access: private. Environment variables created by the Vercel connection:

```
BLOB_READ_WRITE_TOKEN=
BLOB_STORE_ID=
BLOB_WEBHOOK_PUBLIC_KEY=
```

Proof files upload with `access: "private"` using those credentials only. The app never shows the private Blob URL. Owners and verification admins read files at `/api/proofs/[submissionId]`.

### Public profile pictures — `task2stock-profiles`

Access: public. Environment variables created by the Vercel connection (prefix `PROFILES`):

```
PROFILES_READ_WRITE_TOKEN=
PROFILES_STORE_ID=
PROFILES_WEBHOOK_PUBLIC_KEY=
```

Profile pictures upload with `access: "public"` using those credentials only. The public Blob URL is saved on `User.avatarUrl` and displayed directly.

Do not put any Blob token in client code or prefix it with `NEXT_PUBLIC_`. Pull local copies with `npx vercel env pull .env.local`.

Upload does not verify proof. Proof files and profile pictures must not share a store.
