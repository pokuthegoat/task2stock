import { type NextRequest, NextResponse } from "next/server";
import { findOrCreateGoogleUser } from "@/lib/auth/provider";
import {
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  exchangeGoogleAuthorizationCode,
  getRequestOrigin,
  isGoogleConfigured,
  oauthCookieOptions,
  readGoogleProfile,
} from "@/lib/auth/google";
import { persistSessionRow, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

function redirectWithError(origin: string, path: string, code: string) {
  return NextResponse.redirect(new URL(`${path}?error=${code}`, origin));
}

function clearOAuthCookies(response: NextResponse) {
  const expired = oauthCookieOptions(new Date(0));
  response.cookies.set({ name: GOOGLE_STATE_COOKIE, value: "", ...expired });
  response.cookies.set({ name: GOOGLE_VERIFIER_COOKIE, value: "", ...expired });
  response.cookies.set({ name: GOOGLE_NEXT_COOKIE, value: "", ...expired });
  return response;
}

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const nextPath =
    request.cookies.get(GOOGLE_NEXT_COOKIE)?.value === "/signup"
      ? "/signup"
      : "/login";
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!isGoogleConfigured()) {
    return redirectWithError(origin, nextPath, "google_unavailable");
  }

  if (error === "access_denied") {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_cancelled"),
    );
  }

  if (error || !code || !state) {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(GOOGLE_VERIFIER_COOKIE)?.value;

  if (!expectedState || !verifier || expectedState !== state) {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  const accessToken = await exchangeGoogleAuthorizationCode({
    origin,
    code,
    verifier,
  });

  if (!accessToken) {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  const profile = await readGoogleProfile(accessToken);

  if (!profile) {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_email"),
    );
  }

  const result = await findOrCreateGoogleUser(profile);

  if (!result.ok) {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  const { token, expiresAt } = await persistSessionRow(result.user.id);
  const response = NextResponse.redirect(new URL("/tasks", origin));
  response.cookies.set(sessionCookie(token, expiresAt));
  return clearOAuthCookies(response);
}
