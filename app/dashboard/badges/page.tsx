import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { adminApiRequest, getAdminToken, type BadgeCatalogResponse } from "@/lib/admin-api";
import DeleteEntityButton from "../DeleteEntityButton";

export default async function BadgesPage() {
  const token = await getAdminToken();

  if (!token) {
    redirect("/login");
  }

  const result = await adminApiRequest<BadgeCatalogResponse>("/api/admin/badges", token);

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      redirect("/login");
    }

    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        {result.error}
      </div>
    );
  }

  const { badges } = result.data;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white">Catalogue de badges</h2>
          <p className="mt-1 text-sm text-[var(--ares-muted)]">
            {badges.length} badge{badges.length > 1 ? "s" : ""} défini{badges.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/badges/new"
          className="flex h-11 items-center gap-2 rounded-xl bg-[var(--ares-primary)] px-5 text-sm font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Nouveau badge
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ares-border)] bg-[var(--ares-panel)] p-10 text-center text-sm font-semibold text-[var(--ares-muted)]">
          Aucun badge n&apos;a encore été créé.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge._id}
              className={`rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-5 ${
                badge.isActive ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--ares-bg)]">
                  {badge.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={badge.image.url} alt={badge.label} className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-white">{badge.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--ares-muted)]">{badge.key}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--ares-primary)]">+{badge.xpReward} XP</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Link
                  href={`/dashboard/badges/${badge._id}`}
                  className="text-xs font-bold text-[var(--ares-primary)] hover:underline"
                >
                  Modifier
                </Link>
                <DeleteEntityButton
                  endpoint={`/api/admin/badges/${badge._id}`}
                  confirmMessage={`Supprimer le badge "${badge.label}" ? Cette action est irréversible.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
