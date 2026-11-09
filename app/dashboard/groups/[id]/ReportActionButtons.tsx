"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportActionButtons({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "resolved" | "dismissed", deletePost: boolean) => {
    setLoading(true);
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deletePost }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction("resolved", true)}
        className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
      >
        Supprimer la publication
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction("dismissed", false)}
        className="rounded-lg border border-[var(--ares-border)] px-3 py-1.5 text-xs font-bold text-[var(--ares-muted)] hover:text-white disabled:opacity-50"
      >
        Ignorer
      </button>
    </div>
  );
}

