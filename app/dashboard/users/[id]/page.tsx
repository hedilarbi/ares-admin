import Link from "next/link";
import type { ComponentType } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Ruler, ShieldCheck, Trophy, Weight } from "lucide-react";
import {
  adminApiRequest,
  getAdminToken,
  type AppUser,
  type BadgesResponse,
  type DefisResponse,
  type RunsHistoryResponse,
} from "@/lib/admin-api";
import ProfileTabs from "./ProfileTabs";

function photoBackground(photo?: string) {
  if (!photo) {
    return undefined;
  }

  const source = photo.startsWith("http") || photo.startsWith("data:") ? photo : `data:image/jpeg;base64,${photo}`;
  return { backgroundImage: `url(${source})` };
}

function initials(user: AppUser) {
  const label = user.name?.trim() || user.email || "A";
  return label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value?: string, withTime = false) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: withTime ? "short" : undefined,
  }).format(date);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-bg)] p-5">
      <div className="mb-3 flex items-center gap-2 text-[var(--ares-muted)]">
        <Icon aria-hidden className="h-4 w-4" />
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAdminToken();

  if (!token) {
    redirect("/login");
  }

  const [result, runsResult, badgesResult, defisResult] = await Promise.all([
    adminApiRequest<{ user: AppUser }>(`/api/admin/users/${id}`, token),
    adminApiRequest<RunsHistoryResponse>(`/api/admin/users/${id}/runs?limit=10`, token),
    adminApiRequest<BadgesResponse>(`/api/admin/users/${id}/badges`, token),
    adminApiRequest<DefisResponse>(`/api/admin/users/${id}/defis`, token),
  ]);

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      redirect("/login");
    }

    return (
      <div className="max-w-3xl space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error}
        </div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ares-primary)]"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>
      </div>
    );
  }

  const user = result.data.user;
  const progress = Math.min(100, ((user.xp || 0) % 1000) / 10);

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ares-muted)] transition-colors hover:text-[var(--ares-primary)]"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 shadow-xl md:p-8">
        <div className="flex flex-col gap-6 border-b border-[var(--ares-border)] pb-6 sm:flex-row sm:items-center">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--ares-primary)] bg-[var(--ares-bg)] bg-cover bg-center font-display text-2xl font-extrabold text-[var(--ares-primary)]"
            style={photoBackground(user.photo)}
          >
            {!user.photo ? initials(user) : null}
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold text-white">{user.name || "Athlète anonyme"}</h2>
            <p className="mt-1 font-bold text-[var(--ares-primary)]">{user.level || "Débutant"}</p>
            <p className="mt-2 text-sm text-[var(--ares-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase text-[var(--ares-muted-strong)]">Progression XP</p>
            <p className="font-display text-sm font-extrabold text-white">{user.xp || 0} XP</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--ares-bg)]">
            <div className="h-full rounded-full bg-[var(--ares-primary)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={MapPin}
            label="Localisation"
            value={user.city ? `${user.city}${user.country ? `, ${user.country}` : ""}` : "-"}
          />
          <DetailItem icon={ShieldCheck} label="Statut" value={user.isVerified === false ? "Non vérifié" : "Vérifié"} />
          <DetailItem icon={CalendarDays} label="Naissance" value={formatDate(user.dateOfBirth)} />
          <DetailItem icon={Ruler} label="Taille" value={user.height ? `${user.height} cm` : "-"} />
          <DetailItem icon={Weight} label="Poids" value={user.weight ? `${user.weight} kg` : "-"} />
          <DetailItem icon={Trophy} label="Inscription" value={formatDate(user.createdAt, true)} />
        </div>
      </section>

      <ProfileTabs
        runs={runsResult.ok ? runsResult.data.runs : []}
        runsPagination={
          runsResult.ok
            ? runsResult.data.pagination
            : { page: 1, limit: 10, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        }
        badges={badgesResult.ok ? badgesResult.data.badges : []}
        defisEnCours={defisResult.ok ? defisResult.data.enCours : []}
        defisDisponibles={defisResult.ok ? defisResult.data.disponibles : []}
        defisTermines={defisResult.ok ? defisResult.data.termines : []}
      />
    </div>
  );
}
