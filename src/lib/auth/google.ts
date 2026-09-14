import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_STATE_COOKIE = "t2s_google_state";
export const GOOGLE_VERIFIER_COOKIE = "t2s_google_verifier";
export const GOOGLE_NEXT_COOKIE = "t2s_google_next";
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile = {
  email: string;
  name: string;
};

function base64Url(bytes: Buffer) {
  return bytes.toString("base64url");
}

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || "";
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
}

export function isGoogleConfigured() {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

export function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (url.protocol === "https:" ? "https" : "http");

  return `${proto}://${host}`;
}

export function getGoogleCallbackUrl(origin: string) {
  return `${origin}${GOOGLE_CALLBACK_PATH}`;
}

export function oauthReturnPath(referer: string | null) {
  try {
    if (referer && new URL(referer).pathname.startsWith("/signup")) {
      return "/signup";
    }
  } catch {
    // Ignore malformed referers.
  }

  return "/login";
}

export function oauthCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires,
  };
}

export function createGoogleOAuthChallenge() {
  const state = randomBytes(24).toString("hex");
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());

  return { state, verifier, challenge };
}

export function buildGoogleAuthorizationUrl(input: {
  origin: string;
  state: string;
  challenge: string;
}) {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleCallbackUrl(input.origin),
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleAuthorizationCode(input: {
  origin: string;
  code: string;
  verifier: string;
}) {
  const body = new URLSearchParams({
    client_id: getGoogleClientId(),
    client_secret: getGoogleClientSecret(),
    code: input.code,
    code_verifier: input.verifier,
    grant_type: "authorization_code",
    redirect_uri: getGoogleCallbackUrl(input.origin),
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    console.error("[task2stock:google] token exchange failed", response.status);
    return null;
  }

  const payload = (await response.json()) as { access_token?: unknown };
  const accessToken =
    typeof payload.access_token === "string" ? payload.access_token : "";

  return accessToken || null;
}

export async function readGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile | null> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("[task2stock:google] userinfo failed", response.status);
    return null;
  }

  const payload = (await response.json()) as {
    email?: unknown;
    email_verified?: unknown;
    name?: unknown;
    given_name?: unknown;
  };

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const verified =
    payload.email_verified === true || payload.email_verified === "true";

  if (!email || !verified) {
    return null;
  }

  const name =
    (typeof payload.name === "string" && payload.name.trim()) ||
    (typeof payload.given_name === "string" && payload.given_name.trim()) ||
    email.split("@")[0] ||
    "Google user";

  return { email, name };
}
