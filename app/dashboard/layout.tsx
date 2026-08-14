import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_TOKEN_COOKIE, ADMIN_USER_COOKIE, decodeAdminUserCookie, isAdminJwt } from "@/lib/admin-session";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  const admin = decodeAdminUserCookie(cookieStore.get(ADMIN_USER_COOKIE)?.value);

  if (!token || !admin || !isAdminJwt(token)) {
    redirect("/login");
  }

  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}
