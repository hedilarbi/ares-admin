import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BadgeForm from "../BadgeForm";

export default function NewBadgePage() {
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
        <h2 className="mb-6 font-display text-xl font-extrabold text-white">Nouveau badge</h2>
        <BadgeForm />
      </section>
    </div>
  );
}
