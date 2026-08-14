import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, isAdminJwt, getApiBaseUrl } from "@/lib/admin-session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token || !isAdminJwt(token)) {
    return NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 });
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/users?${request.nextUrl.searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Impossible de contacter le serveur backend." }, { status: 503 });
  }
}
