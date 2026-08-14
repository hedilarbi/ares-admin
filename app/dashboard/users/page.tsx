import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { adminApiRequest, getAdminToken, type AppUser, type UsersResponse } from "@/lib/admin-api";

type UsersSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function userInitials(user: AppUser) {
  const label = user.name?.trim() || user.email || "A";
  return label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function photoBackground(photo?: string) {
  if (!photo) {
    return undefined;
  }

  const source = photo.startsWith("http") || photo.startsWith("data:") ? photo : `data:image/jpeg;base64,${photo}`;
  return { backgroundImage: `url(${source})` };
}

function pageHref(page: number, search: string, limit: number) {
  const query = new URLSearchParams();

  if (search) {
    query.set("search", search);
  }

  query.set("page", String(page));
  query.set("limit", String(limit));

  return `/dashboard/users?${query.toString()}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export default async function UsersListPage({ searchParams }: { searchParams: UsersSearchParams }) {
  const params = await searchParams;
  const search = (getParam(params, "search") || "").trim();
  const page = toPositiveInt(getParam(params, "page"), 1);
  const limit = toPositiveInt(getParam(params, "limit"), 10);
  const token = await getAdminToken();

  if (!token) {
    redirect("/login");
  }

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    query.set("search", search);
  }

  const result = await adminApiRequest<UsersResponse>(`/api/admin/users?${query.toString()}`, token);

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

  const { users, pagination } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white">Utilisateurs inscrits</h2>
          <p className="mt-1 text-sm text-[var(--ares-muted)]">
            {pagination.total} profil{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
          </p>
        </div>

        <form action="/dashboard/users" className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="limit" value={limit} />
          <label className="relative min-w-0 flex-1 lg:w-[360px]">
            <span className="sr-only">Rechercher un utilisateur</span>
            <Search aria-hidden className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ares-muted)]" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Nom, email, ville, pays"
              className="h-11 w-full rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] pr-4 pl-11 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[var(--ares-primary)]"
            />
          </label>
          <button
            type="submit"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--ares-primary)] px-5 font-display text-xs font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Search aria-hidden className="h-4 w-4" />
            Rechercher
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] shadow-xl">
        {users.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center p-8 text-center">
            <p className="text-sm font-medium text-[var(--ares-muted)]">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--ares-border)] bg-[var(--ares-bg)] text-xs font-bold uppercase text-[var(--ares-muted-strong)]">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Niveau</th>
                  <th className="px-6 py-4">Localisation</th>
                  <th className="px-6 py-4">Inscription</th>
                  <th className="px-6 py-4 text-right">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ares-border)]/70">
                {users.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-[var(--ares-bg)]/45">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] bg-cover bg-center font-display text-xs font-extrabold text-[var(--ares-primary)]"
                          style={photoBackground(user.photo)}
                        >
                          {!user.photo ? userInitials(user) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">{user.name || "Athlète anonyme"}</p>
                          <p className="text-xs text-[var(--ares-muted)]">
                            {user.isVerified === false ? "Non vérifié" : "Vérifié"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--ares-muted)]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--ares-primary)]">{user.level || "Débutant"}</span>
                      <span className="ml-2 text-xs text-[var(--ares-muted)]">{user.xp || 0} XP</span>
                    </td>
                    <td className="px-6 py-4 text-[var(--ares-muted)]">
                      {user.city ? `${user.city}${user.country ? `, ${user.country}` : ""}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-[var(--ares-muted)]">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/users/${user._id}`}
                        aria-label={`Voir le profil de ${user.name || user.email}`}
                        title="Voir le profil"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] text-[var(--ares-primary)] transition-all hover:border-[var(--ares-primary)] hover:bg-[var(--ares-primary)] hover:text-[var(--ares-panel-strong)]"
                      >
                        <Search aria-hidden className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--ares-muted)]">
          Page {pagination.page} sur {pagination.totalPages}
        </p>

        <div className="flex items-center gap-2">
          {pagination.hasPreviousPage ? (
            <Link
              href={pageHref(pagination.page - 1, search, limit)}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] px-4 text-sm font-bold text-white transition-colors hover:border-[var(--ares-primary)]"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Précédent
            </Link>
          ) : (
            <span className="flex h-10 items-center gap-2 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] px-4 text-sm font-bold text-[var(--ares-muted)] opacity-50">
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Précédent
            </span>
          )}

          {pagination.hasNextPage ? (
            <Link
              href={pageHref(pagination.page + 1, search, limit)}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] px-4 text-sm font-bold text-white transition-colors hover:border-[var(--ares-primary)]"
            >
              Suivant
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex h-10 items-center gap-2 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-panel)] px-4 text-sm font-bold text-[var(--ares-muted)] opacity-50">
              Suivant
              <ChevronRight aria-hidden className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
