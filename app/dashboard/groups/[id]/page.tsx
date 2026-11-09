import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Flag, Globe, Lock, MapPin, ShieldAlert, Users } from "lucide-react";
import {
  adminApiRequest,
  getAdminToken,
  type AdminGroupDetailResponse,
} from "@/lib/admin-api";
import DeleteEntityButton from "../../DeleteEntityButton";
import ReportActionButtons from "./ReportActionButtons";

function formatKm(metres: number) {
  return `${(metres / 1000).toFixed(2).replace(".", ",")} km`;
}

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAdminToken();
  if (!token) {
    redirect("/login");
  }

  const result = await adminApiRequest<AdminGroupDetailResponse>(
    `/api/admin/groups/${id}`,
    token,
  );

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      redirect("/login");
    }
    return (
      <div className="max-w-4xl space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error}
        </div>
        <Link
          href="/dashboard/groups"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ares-primary)]"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour aux groupes
        </Link>
      </div>
    );
  }

  const { group, members, challenges, posts, reports } = result.data;
  const pendingReports = reports.filter((r) => r.status === "pending");

  return (
    <div className="max-w-5xl space-y-6">
      <Link
        href="/dashboard/groups"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ares-muted)] transition-colors hover:text-[var(--ares-primary)]"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Retour aux groupes
      </Link>

      {/* Group Header */}
      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[var(--ares-primary)] px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-[var(--ares-panel-strong)]">
                {group.type === "club" ? "Club de running" : "Groupe d'amis"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ares-muted)]">
                {group.privacy === "private" ? (
                  <>
                    <Lock aria-hidden className="h-3.5 w-3.5" /> Privé
                  </>
                ) : (
                  <>
                    <Globe aria-hidden className="h-3.5 w-3.5" /> Public
                  </>
                )}
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-white">{group.name}</h2>
            {group.description && (
              <p className="mt-2 max-w-2xl text-sm text-[var(--ares-muted)]">{group.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--ares-muted)]">
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden className="h-3.5 w-3.5" />
                {group.city}, {group.governorate}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="h-3.5 w-3.5" />
                {group.memberCount} membres
              </span>
              <span>
                Distance cumulée :{" "}
                <strong className="text-[var(--ares-primary)]">
                  {formatKm(group.totalDistanceMetres || 0)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Reports Section */}
      {pendingReports.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert aria-hidden className="h-5 w-5" />
            <h3 className="font-display text-base font-extrabold">
              Signalements à traiter ({pendingReports.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingReports.map((rep) => (
              <div
                key={rep._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-4"
              >
                <div>
                  <p className="text-xs font-bold text-amber-300">Motif : {rep.reason}</p>
                  <p className="mt-1 text-sm text-white">
                    Publication : &ldquo;{rep.post?.caption || "Course partagée"}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-[var(--ares-muted)]">
                    Signalé par {rep.reporter?.name || rep.reporter?.email || "Utilisateur"}
                  </p>
                </div>
                <ReportActionButtons reportId={rep._id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Group Challenges */}
      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Flag aria-hidden className="h-4 w-4 text-[var(--ares-primary)]" />
          <h3 className="font-display text-base font-extrabold text-white">
            Défis du groupe ({challenges.length})
          </h3>
        </div>
        {challenges.length === 0 ? (
          <p className="text-sm text-[var(--ares-muted)]">Aucun défi organisé dans ce groupe.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {challenges.map((ch) => (
              <div
                key={ch._id}
                className="rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-4"
              >
                <span className="text-[10px] font-bold uppercase text-[var(--ares-primary)]">
                  {ch.mode === "collectif" ? "Défi collectif" : "Défi individuel"}
                </span>
                <p className="mt-1 font-bold text-white">{ch.title}</p>
                <p className="mt-1 text-xs text-[var(--ares-muted)]">
                  Objectif :{" "}
                  {ch.goalType === "distance"
                    ? formatKm(ch.goalValue)
                    : `${ch.goalValue} sorties`}{" "}
                  · {ch.participantCount} participant{ch.participantCount > 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shared Posts in Group Feed */}
      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 space-y-4">
        <h3 className="font-display text-base font-extrabold text-white">
          Publications partagées ({posts.length})
        </h3>
        {posts.length === 0 ? (
          <p className="text-sm text-[var(--ares-muted)]">Aucune activité publiée.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    {post.author?.name || post.author?.pseudo || "Membre"} ·{" "}
                    <span className="text-[var(--ares-primary)]">
                      {post.run ? formatKm(post.run.distanceMetres) : ""}
                    </span>
                  </p>
                  {post.caption && (
                    <p className="mt-1 text-xs text-[var(--ares-muted)]">{post.caption}</p>
                  )}
                </div>
                <DeleteEntityButton
                  endpoint={`/api/admin/groups/${group._id}/posts/${post._id}`}
                  confirmMessage="Supprimer cette publication du fil du groupe ?"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Group Members */}
      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 space-y-4">
        <h3 className="font-display text-base font-extrabold text-white">
          Membres ({members.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div
              key={m._id}
              className="flex items-center justify-between rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-3.5"
            >
              <div>
                <p className="text-sm font-bold text-white">
                  {m.user?.name || m.user?.pseudo || m.user?.email || "Utilisateur"}
                </p>
                <p className="text-xs text-[var(--ares-muted)]">
                  {m.role === "admin" ? "Administrateur" : "Membre"} · Statut : {m.status}
                </p>
              </div>
              {m.user?._id && (
                <Link
                  href={`/dashboard/users/${m.user._id}`}
                  className="text-xs font-bold text-[var(--ares-primary)] hover:underline"
                >
                  Profil →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

