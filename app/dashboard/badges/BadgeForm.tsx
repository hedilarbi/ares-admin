"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BadgeCatalogEntry, BadgeCategory, BadgeCriteriaType, ConditionConfig } from "@/lib/admin-api";

const CATEGORY_OPTIONS: { value: BadgeCategory; label: string }[] = [
  { value: "distance", label: "Distance" },
  { value: "frequence", label: "Fréquence" },
  { value: "vitesse", label: "Vitesse" },
  { value: "social", label: "Social" },
  { value: "special", label: "Spécial" },
];

const CRITERIA_OPTIONS: { value: BadgeCriteriaType; label: string }[] = [
  { value: "distance_totale", label: "Distance totale cumulée (m)" },
  { value: "nb_courses", label: "Nombre de courses" },
  { value: "distance_course", label: "Distance en une seule course (m)" },
  { value: "vitesse_max", label: "Vitesse maximale (m/s)" },
  { value: "manuel", label: "Attribution manuelle" },
];

function inputClass() {
  return "h-11 w-full rounded-xl border border-[var(--ares-border)] bg-[var(--ares-bg)] px-4 text-sm text-white outline-none transition-colors focus:border-[var(--ares-primary)]";
}

export default function BadgeForm({ badge }: { badge?: BadgeCatalogEntry }) {
  const router = useRouter();
  const isEditing = Boolean(badge);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [key, setKey] = useState(badge?.key ?? "");
  const [label, setLabel] = useState(badge?.label ?? "");
  const [description, setDescription] = useState(badge?.description ?? "");
  const [category, setCategory] = useState<BadgeCategory>(badge?.category ?? "special");
  const [criteriaType, setCriteriaType] = useState<BadgeCriteriaType>(badge?.criteriaType ?? "manuel");
  const [criteriaThreshold, setCriteriaThreshold] = useState(String(badge?.criteriaThreshold ?? 0));
  const [xpReward, setXpReward] = useState(String(badge?.xpReward ?? 0));
  const [isActive, setIsActive] = useState(badge?.isActive ?? true);
  const [imagePreview, setImagePreview] = useState<string | null>(badge?.image?.url ?? null);

  const [conditionConfig, setConditionConfig] = useState<ConditionConfig>(
    badge?.conditionConfig ?? {
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
      setImagePreview(badge?.image?.url ?? null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditing && !fileInputRef.current?.files?.length) {
      setErrorMsg("L'image du badge est requise.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    const formData = new FormData();
    formData.set("key", key.trim());
    formData.set("label", label.trim());
    formData.set("description", description.trim());
    formData.set("category", category);
    formData.set("criteriaType", criteriaType);
    formData.set("criteriaThreshold", criteriaThreshold);
    formData.set("xpReward", xpReward);
    formData.set("isActive", String(isActive));
    formData.set("conditionConfig", JSON.stringify(conditionConfig));
    if (fileInputRef.current?.files?.[0]) {
      formData.set("image", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(isEditing ? `/api/admin/badges/${badge!._id}` : "/api/admin/badges", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMsg(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      router.push("/dashboard/badges");
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
            <img src={imagePreview} alt="Aperçu du badge" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs font-semibold text-[var(--ares-muted)]">Aucune image</span>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Image du badge
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Clé unique
          </label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ex. 10k"
            className={inputClass()}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">Nom</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex. 10K"
            className={inputClass()}
            required
          />
        </div>
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
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BadgeCategory)}
            className={inputClass()}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-[var(--ares-muted-strong)]">
            Critère d&apos;obtention
          </label>
          <select
            value={criteriaType}
            onChange={(e) => setCriteriaType(e.target.value as BadgeCriteriaType)}
            className={inputClass()}
          >
            {CRITERIA_OPTIONS.map((option) => (
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
            Seuil du critère
          </label>
          <input
            type="number"
            min={0}
            value={criteriaThreshold}
            onChange={(e) => setCriteriaThreshold(e.target.value)}
            disabled={criteriaType === "manuel"}
            className={`${inputClass()} disabled:opacity-40`}
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

        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-white">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--ares-primary)]"
        />
        Badge actif (visible dans le catalogue)
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 items-center justify-center rounded-xl bg-[var(--ares-primary)] px-6 text-sm font-extrabold text-[var(--ares-panel-strong)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Créer le badge"}
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
