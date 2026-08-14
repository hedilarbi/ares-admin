"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DefiCatalogEntry, DefiGoalType, DefiKind, ConditionConfig } from "@/lib/admin-api";

const KIND_OPTIONS: { value: DefiKind; label: string }[] = [
  { value: "individuel", label: "Individuel" },
  { value: "amis", label: "Entre amis" },
  { value: "clubs", label: "Entre clubs" },
];

const GOAL_TYPE_OPTIONS: { value: DefiGoalType; label: string }[] = [
  { value: "distance", label: "Distance (m)" },
  { value: "nb_courses", label: "Nombre de courses" },
  { value: "vitesse", label: "Vitesse (m/s)" },
  { value: "custom", label: "Personnalisé" },
];

function inputClass() {
  return "h-11 w-full rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] px-4 text-sm text-white outline-none transition-colors focus:border-[var(--ares-primary)]";
}

export default function DefiForm({ defi }: { defi?: DefiCatalogEntry }) {
  const router = useRouter();
  const isEditing = Boolean(defi);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(defi?.title ?? "");
  const [description, setDescription] = useState(defi?.description ?? "");
  const [kind, setKind] = useState<DefiKind>(defi?.kind ?? "individuel");
  const [goalType, setGoalType] = useState<DefiGoalType>(defi?.goalType ?? "distance");
  const [goalValue, setGoalValue] = useState(String(defi?.goalValue ?? 0));
  const [period, setPeriod] = useState(defi?.period ?? "quotidien");
  const [xpReward, setXpReward] = useState(String(defi?.xpReward ?? 0));
  const [isActive, setIsActive] = useState(defi?.isActive ?? true);
  const [imagePreview, setImagePreview] = useState<string | null>(defi?.image?.url ?? null);

  const [conditionConfig, setConditionConfig] = useState<ConditionConfig>(
    defi?.conditionConfig ?? {
      isPerRun: false,
      timeConstraint: "none",
      durationMinutes: 0,
      consecutiveDays: 0,
      uniqueLocations: 0,
      beatPrevious: false,
      ranking: "none",
    }
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImagePreview(defi?.image?.url ?? null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditing && !fileInputRef.current?.files?.length) {
      setErrorMsg("L'image du défi est requise.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description.trim());
    formData.set("kind", kind);
    formData.set("goalType", goalType);
    formData.set("goalValue", goalValue);
    formData.set("period", period);
    formData.set("xpReward", xpReward);
    formData.set("isActive", String(isActive));
    formData.set("conditionConfig", JSON.stringify(conditionConfig));
    if (fileInputRef.current?.files?.[0]) {
      formData.set("image", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(isEditing ? `/api/admin/defis/${defi!._id}` : "/api/admin/defis", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMsg(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      router.push("/dashboard/defis");
      router.refresh();
    } catch {
      setErrorMsg("Impossible de contacter le serveur backend.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{errorMsg}</div>
      ) : null}

      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--ares-border)] bg-[var(--ares-bg)]">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Aperçu du défi" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs font-semibold text-[var(--ares-muted)]">Aucune image</span>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Image du défi
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="text-xs text-[var(--ares-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--ares-primary)] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[var(--ares-panel-strong)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex. Courir 20 km cette semaine"
          className={inputClass()}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ares-primary)]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">Type</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as DefiKind)} className={inputClass()}>
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Type d&apos;objectif
          </label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as DefiGoalType)}
            className={inputClass()}
          >
            {GOAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Valeur cible
          </label>
          <input
            type="number"
            min={0}
            value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
            className={inputClass()}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Récompense XP
          </label>
          <input
            type="number"
            min={0}
            value={xpReward}
            onChange={(e) => setXpReward(e.target.value)}
            className={inputClass()}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Périodicité
          </label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className={inputClass()}>
            <option value="quotidien">Quotidien</option>
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="mensuel">Mensuel</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--ares-border)] bg-[#ffffff05] p-5">
        <h3 className="mb-4 text-sm font-bold text-white">Conditions avancées</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={conditionConfig.isPerRun}
              onChange={(e) => setConditionConfig({ ...conditionConfig, isPerRun: e.target.checked })}
              className="h-4 w-4 accent-[var(--ares-primary)]"
            />
            Appliquer par course (non cumulé)
          </label>
          
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={conditionConfig.beatPrevious}
              onChange={(e) => setConditionConfig({ ...conditionConfig, beatPrevious: e.target.checked })}
              className="h-4 w-4 accent-[var(--ares-primary)]"
            />
            Battre sa distance d&apos;hier
          </label>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Contrainte d&apos;horaire
            </label>
            <select
              value={conditionConfig.timeConstraint}
              onChange={(e) => setConditionConfig({ ...conditionConfig, timeConstraint: e.target.value as any })}
              className={inputClass()}
            >
              <option value="none">Aucune</option>
              <option value="before_8am">Avant 8h00</option>
              <option value="after_8pm">Après 20h00</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Durée min. (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={conditionConfig.durationMinutes || ""}
              onChange={(e) => setConditionConfig({ ...conditionConfig, durationMinutes: Number(e.target.value) })}
              placeholder="ex. 30"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Jours consécutifs
            </label>
            <input
              type="number"
              min={0}
              value={conditionConfig.consecutiveDays || ""}
              onChange={(e) => setConditionConfig({ ...conditionConfig, consecutiveDays: Number(e.target.value) })}
              placeholder="ex. 3"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Lieux différents
            </label>
            <input
              type="number"
              min={0}
              value={conditionConfig.uniqueLocations || ""}
              onChange={(e) => setConditionConfig({ ...conditionConfig, uniqueLocations: Number(e.target.value) })}
              placeholder="ex. 10"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
              Classement
            </label>
            <select
              value={conditionConfig.ranking}
              onChange={(e) => setConditionConfig({ ...conditionConfig, ranking: e.target.value as any })}
              className={inputClass()}
            >
              <option value="none">Aucun</option>
              <option value="top_100_city">Top 100 ville</option>
              <option value="top_10_city">Top 10 ville</option>
              <option value="top_1_city">Top 1 ville</option>
              <option value="top_10_country">Top 10 pays</option>
            </select>
          </div>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--ares-primary)]"
        />
        Défi actif (visible dans le catalogue)
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 items-center justify-center rounded-xl bg-[var(--ares-primary)] px-6 text-sm font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Créer le défi"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-11 items-center justify-center rounded-xl border border-[var(--ares-border)] px-6 text-sm font-bold text-[var(--ares-muted)] transition-colors hover:text-white"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
