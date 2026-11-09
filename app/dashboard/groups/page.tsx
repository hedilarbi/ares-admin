import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Globe, Lock, MapPin, Users } from "lucide-react";
import {
  adminApiRequest,
  getAdminToken,
  type AdminGroupsResponse,
} from "@/lib/admin-api";
import DeleteEntityButton from "../DeleteEntityButton";

function formatKm(metres: number) {
  return `${(metres / 1000).toFixed(2).replace(".", ",")} km`;
}

export default async function AdminGroupsPage() {
  const token = await getAdminToken();
  if (!token) {
    redirect("/login");
  }

  const result = await adminApiRequest<AdminGroupsResponse>(
    "/api/admin/groups?limit=50",
    token,
  );

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

  const { groups, pendingReportsCount } = result.data;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white">
            Groupes & Clubs ARES Running
          </h2>
          <p className="mt-1 text-sm text-[var(--ares-muted)]">
            {groups.length} groupe{groups.length > 1 ? "s" : ""} enregistré
            {groups.length > 1 ? "s" : ""}
          </p>
        </div>

        {pendingReportsCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-extrabold text-amber-300">
            <AlertTriangle aria-hidden className="h-4 w-4" />
            {pendingReportsCount} signalement{pendingReportsCount > 1 ? "s" : ""} en attente
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ares-border)] bg-[var(--ares-panel)] p-10 text-center text-sm font-semibold text-[var(--ares-muted)]">
          Aucun groupe n&apos;a encore été créé par les utilisateurs.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      group.type === "club"
                        ? "bg-[var(--ares-primary)] text-[var(--ares-panel-strong)]"
                        : "bg-sky-500/20 text-sky-300"
                    }`}
                  >
                    {group.type === "club" ? "Club de running" : "Groupe d'amis"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ares-muted)]">
                    {group.privacy === "private" ? (
                      <>
                        <Lock aria-hidden className="h-3 w-3" /> Privé
                      </>
                    ) : (
                      <>
                        <Globe aria-hidden className="h-3 w-3" /> Public
                      </>
                    )}
                  </span>
                </div>

                <Link
                  href={`/dashboard/groups/${group._id}`}
                  className="mt-1.5 block truncate font-display text-base font-extrabold text-white hover:text-[var(--ares-primary)]"
                >
                  {group.name}
                </Link>

                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[var(--ares-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden className="h-3.5 w-3.5" />
                    {[group.city, group.governorate].filter(Boolean).join(", ") ||
                      `National (${group.country || "Tunisie"})`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users aria-hidden className="h-3.5 w-3.5" />
                    {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                  </span>
                  <span>
                    Créateur :{" "}
                    <strong className="text-white">
                      {group.creator?.name || group.creator?.pseudo || group.creator?.email || "-"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-sm font-extrabold text-[var(--ares-primary)]">
                    {formatKm(group.totalDistanceMetres || 0)}
                  </p>
                  <p className="text-[11px] text-[var(--ares-muted)]">
                    {group.totalRunsCount || 0} contribution{(group.totalRunsCount || 0) > 1 ? "s" : ""}
                  </p>
                </div>

                <Link
                  href={`/dashboard/groups/${group._id}`}
                  className="rounded-xl border border-[var(--ares-border)] px-3 py-2 text-xs font-bold text-white transition-colors hover:border-[var(--ares-primary)] hover:text-[var(--ares-primary)]"
                >
                  Détails
                </Link>

                <DeleteEntityButton
                  endpoint={`/api/admin/groups/${group._id}`}
                  confirmMessage={`Supprimer le groupe "${group.name}" et toutes ses publications ?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

