import { NextResponse } from "next/server";
import {
  beginGoogleOAuth,
  isGoogleOAuthConfigured,
  resolveAppUrl,
} from "@/lib/auth/google";

export async function GET() {
  const appUrl = await resolveAppUrl();

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google", appUrl));
  }

  const url = await beginGoogleOAuth();

  if (!url) {
    return NextResponse.redirect(new URL("/login?error=google", appUrl));
  }

  return NextResponse.redirect(url);
}
