import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { adminApiRequest, getAdminToken, type DefiCatalogResponse } from "@/lib/admin-api";
import DeleteEntityButton from "../DeleteEntityButton";

const KIND_LABELS: Record<string, string> = {
  individuel: "Individuel",
  amis: "Entre amis",
  clubs: "Entre clubs",
};

const PERIOD_LABELS: Record<string, string> = {
  quotidien: "Quotidien",
  hebdomadaire: "Hebdomadaire",
  mensuel: "Mensuel",
};

export default async function DefisPage() {
  const token = await getAdminToken();

  if (!token) {
    redirect("/login");
  }

  const result = await adminApiRequest<DefiCatalogResponse>("/api/admin/defis", token);

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

  const { defis } = result.data;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white">Catalogue de défis</h2>
          <p className="mt-1 text-sm text-[var(--ares-muted)]">
            {defis.length} défi{defis.length > 1 ? "s" : ""} défini{defis.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/defis/new"
          className="flex h-11 items-center gap-2 rounded-xl bg-[var(--ares-primary)] px-5 text-sm font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Nouveau défi
        </Link>
      </div>

      {defis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ares-border)] bg-[var(--ares-panel)] p-10 text-center text-sm font-semibold text-[var(--ares-muted)]">
          Aucun défi n&apos;a encore été créé.
        </div>
      ) : (
        <div className="space-y-3">
          {defis.map((defi) => (
            <div
              key={defi._id}
              className={`flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-5 ${
                defi.isActive ? "" : "opacity-50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ares-muted)]">
                  {KIND_LABELS[defi.kind] ?? defi.kind}
                </p>
                <p className="mt-1 truncate text-sm font-extrabold text-white">{defi.title}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--ares-muted)]">
                  Périodicité : {PERIOD_LABELS[defi.period] ?? defi.period} · Objectif {defi.goalValue} ({defi.goalType})
                </p>
              </div>

              <p className="shrink-0 text-xs font-bold text-[var(--ares-primary)]">+{defi.xpReward} XP</p>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/dashboard/defis/${defi._id}`}
                  className="text-xs font-bold text-[var(--ares-primary)] hover:underline"
                >
                  Modifier
                </Link>
                <DeleteEntityButton
                  endpoint={`/api/admin/defis/${defi._id}`}
                  confirmMessage={`Supprimer le défi "${defi.title}" ? Cette action est irréversible.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
