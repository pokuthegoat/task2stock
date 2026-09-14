import { NextResponse } from "next/server";
import {
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  buildGoogleAuthorizationUrl,
  createGoogleOAuthChallenge,
  getRequestOrigin,
  isGoogleConfigured,
  oauthCookieOptions,
  oauthReturnPath,
  sealOAuthState,
} from "@/lib/auth/google";

export const runtime = "nodejs";

const OAUTH_TTL_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);
  const nextPath = oauthReturnPath(request.headers.get("referer"));

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(
      new URL(`${nextPath}?error=google_unavailable`, origin),
    );
  }

  const { verifier, challenge } = createGoogleOAuthChallenge();
  const state = sealOAuthState({ verifier, nextPath });
  const expires = new Date(Date.now() + OAUTH_TTL_MS);
  const response = NextResponse.redirect(
    buildGoogleAuthorizationUrl({ origin, state, challenge }),
  );

  response.cookies.set({
    name: GOOGLE_STATE_COOKIE,
    value: state,
    ...oauthCookieOptions(expires),
  });
  response.cookies.set({
    name: GOOGLE_VERIFIER_COOKIE,
    value: verifier,
    ...oauthCookieOptions(expires),
  });
  response.cookies.set({
    name: GOOGLE_NEXT_COOKIE,
    value: nextPath,
    ...oauthCookieOptions(expires),
  });

  return response;
}
