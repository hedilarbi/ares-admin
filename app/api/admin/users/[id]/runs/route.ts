import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getApiBaseUrl, isAdminJwt } from "@/lib/admin-session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token || !isAdminJwt(token)) {
    return NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 });
  }

  const { id } = await params;
  const query = new URLSearchParams();
  for (const key of ["page", "limit"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value && /^\d+$/.test(value)) {
      query.set(key, value);
    }
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(id)}/runs?${query}`, {
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
