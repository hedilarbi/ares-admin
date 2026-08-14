import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, getApiBaseUrl, isAdminJwt } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token || !isAdminJwt(token)) {
    return NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetch(`${getApiBaseUrl()}/api/admin/defis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Impossible de contacter le serveur backend." }, { status: 503 });
  }
}
