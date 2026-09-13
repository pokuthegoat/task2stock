import { NextResponse } from "next/server";
import { finishGoogleOAuth, resolveAppUrl } from "@/lib/auth/google";

export async function GET(request: Request) {
  const appUrl = await resolveAppUrl();
  const incoming = new URL(request.url);
  const result = await finishGoogleOAuth({
    code: incoming.searchParams.get("code"),
    state: incoming.searchParams.get("state"),
  });

  if (!result.ok) {
    const target = new URL("/login", appUrl);
    target.searchParams.set("error", "google");
    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(new URL("/tasks", appUrl));
}
