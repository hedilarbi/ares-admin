import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, ADMIN_USER_COOKIE, getApiBaseUrl, isAdminJwt } from "./lib/admin-session";

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function clearAndRedirectToLogin(request: NextRequest) {
  const response = redirectTo(request, "/login");
  response.cookies.delete(ADMIN_TOKEN_COOKIE);
  response.cookies.delete(ADMIN_USER_COOKIE);
  return response;
}

async function verifyAdminSession(token: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return response.ok && data?.user?.role === "admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isRoot = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!isLogin && !isRoot && !isDashboard) {
    return NextResponse.next();
  }

  if (!token || !isAdminJwt(token)) {
    if (isLogin) {
      return NextResponse.next();
    }

    return clearAndRedirectToLogin(request);
  }

  const hasValidAdminRole = await verifyAdminSession(token);

  if (!hasValidAdminRole) {
    if (isLogin) {
      const response = NextResponse.next();
      response.cookies.delete(ADMIN_TOKEN_COOKIE);
      response.cookies.delete(ADMIN_USER_COOKIE);
      return response;
    }

    return clearAndRedirectToLogin(request);
  }

  if (isLogin || isRoot) {
    return redirectTo(request, "/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
