import { NextResponse } from "next/server";
import { canAccessProofFile } from "@/lib/proof/access";
import { getStorageProvider } from "@/lib/storage/provider";

export async function GET(
  _request: Request,
  context: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await context.params;
  const access = await canAccessProofFile(submissionId);

  if (!access.ok || !access.submission?.file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const stored = await getStorageProvider().get(access.submission.file.storageKey);

  if (!stored) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(stored.bytes), {
    headers: {
      "Content-Type": access.submission.file.contentType,
      "Content-Disposition": `inline; filename="${access.submission.file.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
