"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Identifiants administrateur invalides.");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Impossible de se connecter au serveur backend.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ares-bg)] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-panel)] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-baseline gap-2">
            <span className="font-display text-3xl font-black italic tracking-normal">ARES</span>
            <span className="font-display text-3xl font-extrabold italic tracking-normal text-[var(--ares-primary)]">
              RUNNING
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase text-[var(--ares-muted)]">Dashboard Admin</p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Adresse E-mail
            </label>
            <div className="flex h-[52px] items-center gap-3 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] px-4 transition-colors focus-within:border-[var(--ares-primary)]">
              <Mail aria-hidden className="h-4 w-4 text-[var(--ares-muted)]" />
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Mot de passe
            </label>
            <div className="flex h-[52px] items-center gap-3 rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] px-4 transition-colors focus-within:border-[var(--ares-primary)]">
              <LockKeyhole aria-hidden className="h-4 w-4 text-[var(--ares-muted)]" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--ares-primary)] font-display text-sm font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ares-panel-strong)] border-t-transparent" />
            ) : (
              "CONNEXION ADMIN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
