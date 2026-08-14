import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminApiRequest, getAdminToken, type BadgeCatalogEntry } from "@/lib/admin-api";
import BadgeForm from "../BadgeForm";

export default async function EditBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAdminToken();

  if (!token) {
    redirect("/login");
  }

  const result = await adminApiRequest<{ badge: BadgeCatalogEntry }>(`/api/admin/badges/${id}`, token);

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard/badges"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ares-muted)] transition-colors hover:text-[var(--ares-primary)]"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Retour aux badges
      </Link>

      <section className="rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-6 shadow-xl md:p-8">
        <h2 className="mb-6 font-display text-xl font-extrabold text-white">Modifier le badge</h2>
        {result.ok ? (
          <BadgeForm badge={result.data.badge} />
        ) : (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {result.error}
          </div>
        )}
      </section>
    </div>
  );
}
