import { type NextRequest, NextResponse } from "next/server";
import { findOrCreateGoogleUser } from "@/lib/auth/provider";
import {
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  exchangeGoogleAuthorizationCode,
  getRequestOrigin,
  isGoogleConfigured,
  logGoogleCallback,
  oauthCookieOptions,
  openOAuthState,
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
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const sealed = state ? openOAuthState(state) : null;
  const nextPath = sealed?.nextPath ?? "/login";

  if (!isGoogleConfigured()) {
    return redirectWithError(origin, nextPath, "google_unavailable");
  }

  if (error === "access_denied") {
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_cancelled"),
    );
  }

  if (error || !code || !state) {
    logGoogleCallback(error ? `google_error:${error}` : "missing_code_or_state");
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  if (!sealed) {
    logGoogleCallback("invalid_state");
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  const accessToken = await exchangeGoogleAuthorizationCode({
    origin,
    code,
    verifier: sealed.verifier,
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
    logGoogleCallback("user_lookup_or_create");
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }

  try {
    const { token, expiresAt } = await persistSessionRow(result.user.id);
    const response = NextResponse.redirect(new URL("/tasks", origin));
    response.cookies.set(sessionCookie(token, expiresAt));
    return clearOAuthCookies(response);
  } catch (caught) {
    logGoogleCallback("session_create");
    console.error("[task2stock:google] session create failed");
    if (caught instanceof Error) {
      console.error("[task2stock:google]", caught.name);
    }
    return clearOAuthCookies(
      redirectWithError(origin, nextPath, "google_failed"),
    );
  }
}
