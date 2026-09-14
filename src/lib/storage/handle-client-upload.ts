import "server-only";

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PROOF_MAX_BYTES } from "@/lib/proof/types";
import {
  requireBlobReadWriteToken,
  type BlobStoreKind,
} from "@/lib/storage/blob-env";

function parseKind(clientPayload: string | null): "proof" | "avatar" | null {
  try {
    const parsed = JSON.parse(clientPayload ?? "{}") as { kind?: string };
    if (parsed.kind === "avatar") return "avatar";
    if (parsed.kind === "proof") return "proof";
    return null;
  } catch {
    return null;
  }
}

export async function handleStoreClientUpload(
  request: Request,
  store: BlobStoreKind,
) {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const expectedKind = store === "profile" ? "avatar" : "proof";

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: requireBlobReadWriteToken(store),
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getSession();

        if (!session?.user.username) {
          throw new Error("Not authenticated");
        }

        const kind = parseKind(clientPayload);

        if (kind !== expectedKind) {
          throw new Error("Wrong Blob store");
        }

        const prefix =
          kind === "avatar"
            ? `avatars/${session.user.id}/`
            : `proofs/${session.user.id}/`;

        if (!pathname.startsWith(prefix)) {
          throw new Error("Invalid upload path");
        }

        if (kind === "avatar") {
          return {
            allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
            maximumSizeInBytes: 5 * 1024 * 1024,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({
              kind,
              userId: session.user.id,
              store,
            }),
          };
        }

        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp"],
          maximumSizeInBytes: PROOF_MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            kind,
            userId: session.user.id,
            store,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Database writes happen in the form action so local dev does not
        // depend on Vercel calling this webhook.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch {
    return NextResponse.json(
      { error: "Unable to upload." },
      { status: 400 },
    );
  }
}
