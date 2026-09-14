import { upload } from "@vercel/blob/client";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "file";
}

export async function uploadProofBlob(userId: string, file: File) {
  return upload(
    `proofs/${userId}/${crypto.randomUUID()}/${safeFileName(file.name)}`,
    file,
    {
      access: "private",
      handleUploadUrl: "/api/blob/proofs/upload",
      clientPayload: JSON.stringify({ kind: "proof" }),
      multipart: file.size > 4.5 * 1024 * 1024,
    },
  );
}

export async function uploadAvatarBlob(userId: string, file: File) {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Profile pictures must be 5 MB or smaller.");
  }

  return upload(
    `avatars/${userId}/${safeFileName(file.name)}`,
    file,
    {
      access: "public",
      handleUploadUrl: "/api/blob/profiles/upload",
      clientPayload: JSON.stringify({ kind: "avatar" }),
    },
  );
}
