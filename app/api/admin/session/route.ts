import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_MAX_AGE,
  ADMIN_TOKEN_COOKIE,
  ADMIN_USER_COOKIE,
  decodeAdminUserCookie,
  encodeAdminUserCookie,
  getApiBaseUrl,
  isAdminJwt,
  normalizeAdminUser,
} from "@/lib/admin-session";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE,
};

function clearSession(response: NextResponse) {
  response.cookies.delete(ADMIN_TOKEN_COOKIE);
  response.cookies.delete(ADMIN_USER_COOKIE);
  return response;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: typeof data.error === "string" ? data.error : "Identifiants administrateur invalides." },
        { status: response.status },
      );
    }

    const user = normalizeAdminUser(data.user);

    if (!user || typeof data.token !== "string" || !isAdminJwt(data.token)) {
      return NextResponse.json({ error: "Session administrateur invalide." }, { status: 403 });
    }

    const session = NextResponse.json({ user });
    session.cookies.set(ADMIN_TOKEN_COOKIE, data.token, cookieOptions);
    session.cookies.set(ADMIN_USER_COOKIE, encodeAdminUserCookie(user), cookieOptions);

    return session;
  } catch {
    return NextResponse.json({ error: "Impossible de contacter le serveur backend." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const cookieUser = decodeAdminUserCookie(request.cookies.get(ADMIN_USER_COOKIE)?.value);

  if (!token || !cookieUser || !isAdminJwt(token)) {
    return clearSession(NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 }));
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    const user = normalizeAdminUser(data.user);

    if (!response.ok || !user) {
      return clearSession(NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 }));
    }

    const session = NextResponse.json({ user });
    session.cookies.set(ADMIN_USER_COOKIE, encodeAdminUserCookie(user), cookieOptions);

    return session;
  } catch {
    return NextResponse.json({ error: "Impossible de vérifier la session." }, { status: 503 });
  }
}

export async function DELETE() {
  return clearSession(NextResponse.json({ ok: true }));
}
