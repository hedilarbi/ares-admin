"use client";

import { useState } from "react";
import { Award, Flag, History } from "lucide-react";
import type {
  AdminBadge,
  AdminDefiAvailable,
  AdminDefiParticipation,
  AdminRun,
  Pagination,
} from "@/lib/admin-api";

type TabKey = "historique" | "badges" | "defis";

const TABS: { key: TabKey; label: string; icon: typeof History }[] = [
  { key: "historique", label: "Historique", icon: History },
  { key: "badges", label: "Badges", icon: Award },
  { key: "defis", label: "Défis", icon: Flag },
];

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

function formatDistance(metres: number) {
  const km = metres / 1000;
  return `${km.toFixed(km >= 10 ? 1 : 2).replace(".", ",")} km`;
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

function formatPace(secondsPerKm: number) {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm)) return "-";
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ares-border)] bg-[var(--ares-bg)] p-8 text-center text-sm font-semibold text-[var(--ares-muted)]">
      {label}
    </div>
  );
}

function RunHistoryTab({ runs, pagination }: { runs: AdminRun[]; pagination: Pagination }) {
  if (runs.length === 0) {
    return <EmptyState label="Cet utilisateur n'a enregistré aucune course pour le moment." />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase text-[var(--ares-muted)]">
        {pagination.total} course{pagination.total > 1 ? "s" : ""} au total
        {pagination.totalPages > 1 ? ` · affichage des ${runs.length} plus récentes` : ""}
      </p>

      {runs.map((run) => (
        <div
          key={run._id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-4"
        >
          {run.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={run.photo.url}
              alt="Photo de la course"
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--ares-panel-strong)] text-[var(--ares-muted)]">
              <Flag aria-hidden className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{formatDate(run.startedAt)}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--ares-muted)]">
              {formatDistance(run.distanceMetres)} · {formatDuration(run.durationSeconds)} ·{" "}
              {formatPace(run.averagePaceSecondsPerKm)}
            </p>
          </div>

          <p className="shrink-0 font-display text-sm font-extrabold text-[var(--ares-primary)]">
            {Math.round(run.caloriesKcal)} kcal
          </p>
        </div>
      ))}
    </div>
  );
}

function BadgesTab({ badges }: { badges: AdminBadge[] }) {
  if (badges.length === 0) {
    return <EmptyState label="Aucun badge n'est encore défini dans le catalogue." />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
            badge.unlocked
              ? "border-[var(--ares-primary)]/40 bg-[var(--ares-bg)]"
              : "border-[var(--ares-border)] bg-[var(--ares-bg)] opacity-45"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--ares-panel-strong)]">
            {badge.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badge.imageUrl}
                alt={badge.label}
                className={`h-full w-full object-contain ${badge.unlocked ? "" : "grayscale"}`}
              />
            ) : null}
          </div>
          <p className="text-xs font-extrabold text-white">{badge.label}</p>
          <p className="text-[11px] font-semibold text-[var(--ares-muted)]">
            {badge.unlocked ? `Débloqué le ${formatDate(badge.unlockedAt ?? undefined)}` : "Verrouillé"}
          </p>
        </div>
      ))}
    </div>
  );
}

function DefiCard({ defi, joined }: { defi: AdminDefiParticipation | AdminDefiAvailable; joined: boolean }) {
  const participation = joined ? (defi as AdminDefiParticipation) : null;
  const pct = participation ? participation.pct : 0;
  const barColor = participation?.status === "termine" ? "bg-white" : "bg-[var(--ares-primary)]";

  return (
    <div className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ares-muted)]">
            {defi.kind === "amis" ? "Entre amis" : defi.kind === "clubs" ? "Entre clubs" : "Individuel"}
          </p>
          <p className="mt-1 text-sm font-bold text-white">{defi.title}</p>
        </div>
        <p className="shrink-0 text-xs font-extrabold text-[var(--ares-primary)]">+{defi.xpReward} XP</p>
      </div>

      {joined && participation ? (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ares-panel-strong)]">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--ares-muted)]">
            {participation.status === "termine"
              ? `Terminé le ${formatDate(participation.completedAt ?? undefined)}`
              : participation.status === "echoue"
                ? "Échoué"
                : `${participation.progressValue} / ${participation.goalValue}`}
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs font-semibold text-[var(--ares-muted)]">
          Se termine le {formatDate((defi as AdminDefiAvailable).endAt)}
        </p>
      )}
    </div>
  );
}

function DefisTab({
  enCours,
  disponibles,
  termines,
}: {
  enCours: AdminDefiParticipation[];
  disponibles: AdminDefiAvailable[];
  termines: AdminDefiParticipation[];
}) {
  if (enCours.length === 0 && disponibles.length === 0 && termines.length === 0) {
    return <EmptyState label="Aucun défi n'est encore défini dans le catalogue." />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase text-[var(--ares-muted-strong)]">
          En cours ({enCours.length})
        </h3>
        {enCours.length === 0 ? (
          <EmptyState label="Aucun défi en cours." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enCours.map((defi) => (
              <DefiCard key={defi.id} defi={defi} joined />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-bold uppercase text-[var(--ares-muted-strong)]">
          Disponibles ({disponibles.length})
        </h3>
        {disponibles.length === 0 ? (
          <EmptyState label="Aucun défi disponible." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {disponibles.map((defi) => (
              <DefiCard key={defi.id} defi={defi} joined={false} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-bold uppercase text-[var(--ares-muted-strong)]">
          Terminés ({termines.length})
        </h3>
        {termines.length === 0 ? (
          <EmptyState label="Aucun défi terminé." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {termines.map((defi) => (
              <DefiCard key={defi.id} defi={defi} joined />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfileTabs({
  runs,
  runsPagination,
  badges,
  defisEnCours,
  defisDisponibles,
  defisTermines,
}: {
  runs: AdminRun[];
  runsPagination: Pagination;
  badges: AdminBadge[];
  defisEnCours: AdminDefiParticipation[];
  defisDisponibles: AdminDefiAvailable[];
  defisTermines: AdminDefiParticipation[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("historique");

  return (
    <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 shadow-xl md:p-8">
      <div className="flex gap-2 border-b border-[var(--ares-border)] pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "bg-[var(--ares-primary)] text-[var(--ares-panel-strong)]"
                  : "text-[var(--ares-muted)] hover:bg-[var(--ares-bg)] hover:text-white"
              }`}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {activeTab === "historique" ? <RunHistoryTab runs={runs} pagination={runsPagination} /> : null}
        {activeTab === "badges" ? <BadgesTab badges={badges} /> : null}
        {activeTab === "defis" ? (
          <DefisTab enCours={defisEnCours} disponibles={defisDisponibles} termines={defisTermines} />
        ) : null}
      </div>
    </section>
  );
}
