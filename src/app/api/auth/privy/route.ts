import { NextResponse } from "next/server";
import { completePrivyLogin } from "@/lib/auth/complete-privy-login";
import { sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  try {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      "";
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false as const, error: "Privy login could not be verified. Try again." },
      { status: 403 },
    );
  }

  let body: { accessToken?: unknown; identityToken?: unknown } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false as const, error: "Privy login could not be verified. Try again." },
      { status: 400 },
    );
  }

  const result = await completePrivyLogin({
    accessToken: typeof body.accessToken === "string" ? body.accessToken : "",
    identityToken:
      typeof body.identityToken === "string" ? body.identityToken : "",
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true as const,
    next: result.next,
  });
  response.cookies.set(sessionCookie(result.token, result.expiresAt));
  return response;
}
