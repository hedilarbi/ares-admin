"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Award, Bell, Flag, LayoutDashboard, LogOut, Users } from "lucide-react";
import type { AdminUser } from "@/lib/admin-session";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Utilisateurs", icon: Users },
  { href: "/dashboard/badges", label: "Badges", icon: Award },
  { href: "/dashboard/defis", label: "Défis", icon: Flag },
];

function pageTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/users/")) {
    return "Profil utilisateur";
  }

  if (pathname.startsWith("/dashboard/users")) {
    return "Utilisateurs";
  }

  if (pathname.startsWith("/dashboard/badges")) {
    return "Badges";
  }

  if (pathname.startsWith("/dashboard/defis")) {
    return "Défis";
  }

  return "Tableau de bord";
}

export default function DashboardShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = admin.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--ares-bg)] text-white md:flex">
      <aside className="border-b border-[var(--ares-border)] bg-[var(--ares-panel)] p-4 md:flex md:min-h-screen md:w-[272px] md:flex-col md:justify-between md:border-r md:border-b-0 md:p-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-baseline gap-2 px-1 no-underline">
            <span className="font-display text-2xl font-black italic tracking-normal text-white">ARES</span>
            <span className="font-display text-2xl font-extrabold italic tracking-normal text-[var(--ares-primary)]">
              RUNNING
            </span>
          </Link>
          <p className="mt-1 px-1 text-xs font-semibold uppercase text-[var(--ares-muted)]">Panneau Admin</p>

          <nav className="mt-6 flex gap-2 overflow-x-auto md:block md:space-y-2 md:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    active
                      ? "bg-[var(--ares-primary)] text-[var(--ares-panel-strong)]"
                      : "text-[var(--ares-muted)] hover:bg-[var(--ares-bg)] hover:text-white"
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 hidden border-t border-[var(--ares-border)] pt-4 md:block">
          <p className="truncate text-sm font-bold text-white">{admin.name}</p>
          <p className="mt-1 truncate text-xs font-medium text-[var(--ares-muted)]">{admin.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 px-3 py-2.5 text-xs font-extrabold text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.98]"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-18 items-center justify-between gap-4 border-b border-[var(--ares-border)] bg-[var(--ares-panel)] px-4 py-3 md:px-8">
          <h1 className="font-display text-lg font-extrabold text-white md:text-xl">{pageTitle(pathname)}</h1>

          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] text-[var(--ares-muted)] transition-colors hover:text-white"
            >
              <Bell aria-hidden className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--ares-primary)]" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ares-primary)] font-display text-sm font-extrabold text-[var(--ares-panel-strong)]">
                {initials || "A"}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-bold text-white">{admin.name}</p>
                <p className="truncate text-xs text-[var(--ares-muted)]">{admin.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
