import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export const GOOGLE_STATE_COOKIE = "t2s_google_state";
export const GOOGLE_VERIFIER_COOKIE = "t2s_google_verifier";
export const GOOGLE_NEXT_COOKIE = "t2s_google_next";
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export type GoogleProfile = {
  email: string;
  name: string;
};

function base64Url(bytes: Buffer) {
  return bytes.toString("base64url");
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
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
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    firstHeaderValue(request.headers.get("host")) ||
    url.host;
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
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

function oauthStateKey() {
  return createHash("sha256").update(getGoogleClientSecret()).digest();
}

export function createGoogleOAuthChallenge() {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());

  return { verifier, challenge };
}

export function sealOAuthState(input: { verifier: string; nextPath: string }) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", oauthStateKey(), iv);
  const plaintext = Buffer.from(
    JSON.stringify({
      v: input.verifier,
      n: input.nextPath,
      t: Date.now(),
    }),
    "utf8",
  );
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function openOAuthState(state: string) {
  try {
    const packed = Buffer.from(state, "base64url");
    if (packed.length < 29) {
      return null;
    }

    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const encrypted = packed.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", oauthStateKey(), iv);
    decipher.setAuthTag(tag);
    const parsed = JSON.parse(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
        "utf8",
      ),
    ) as { v?: unknown; n?: unknown; t?: unknown };

    if (
      typeof parsed.v !== "string" ||
      typeof parsed.n !== "string" ||
      typeof parsed.t !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.t > OAUTH_STATE_TTL_MS) {
      return null;
    }

    return {
      verifier: parsed.v,
      nextPath: parsed.n === "/signup" ? "/signup" : "/login",
    };
  } catch {
    return null;
  }
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

  let payload: { access_token?: unknown; error?: unknown } = {};

  try {
    payload = (await response.json()) as {
      access_token?: unknown;
      error?: unknown;
    };
  } catch {
    console.error(
      "[task2stock:google] token exchange failed",
      response.status,
      "non_json",
    );
    return null;
  }

  if (!response.ok) {
    const googleError =
      typeof payload.error === "string" ? payload.error : "unknown";
    console.error(
      "[task2stock:google] token exchange failed",
      response.status,
      googleError,
    );
    return null;
  }

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

export function logGoogleCallback(reason: string) {
  console.error("[task2stock:google] callback failed", reason);
}
