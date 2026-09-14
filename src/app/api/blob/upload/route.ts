import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Use /api/blob/proofs/upload for proof files or /api/blob/profiles/upload for profile pictures.",
    },
    { status: 400 },
  );
}
