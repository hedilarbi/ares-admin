import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, getApiBaseUrl } from "./admin-session";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AppUser = {
  _id: string;
  email: string;
  name?: string;
  photo?: string;
  sex?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  city?: string;
  country?: string;
  level?: string;
  xp?: number;
  isVerified?: boolean;
  createdAt?: string;
};

export type UsersResponse = {
  users: AppUser[];
  pagination: Pagination;
};

export type AdminRun = {
  _id: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  distanceMetres: number;
  averageSpeedMps: number;
  maxSpeedMps: number;
  averagePaceSecondsPerKm: number;
  caloriesKcal: number;
  photo: { url: string } | null;
};

export type RunsHistoryResponse = {
  runs: AdminRun[];
  pagination: Pagination;
};

export type AdminBadge = {
  id: string;
  key: string;
  label: string;
  description?: string;
  imageUrl: string | null;
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type BadgesResponse = {
  badges: AdminBadge[];
};

export type BadgeCategory = "distance" | "frequence" | "vitesse" | "social" | "special";
export type BadgeCriteriaType =
  | "distance_totale"
  | "nb_courses"
  | "distance_course"
  | "vitesse_max"
  | "manuel";

export type ConditionConfig = {
  isPerRun: boolean;
  timeConstraint: "none" | "before_8am" | "after_8pm";
  durationMinutes: number;
  consecutiveDays: number;
  uniqueLocations: number;
  beatPrevious: boolean;
  ranking: "none" | "top_100_city" | "top_10_city" | "top_1_city" | "top_10_country";
};

export type BadgeCatalogEntry = {
  _id: string;
  key: string;
  label: string;
  description?: string;
  image: { url: string; path: string } | null;
  category: BadgeCategory;
  criteriaType: BadgeCriteriaType;
  criteriaThreshold: number;
  conditionConfig: ConditionConfig;
  xpReward: number;
  isActive: boolean;
  createdAt: string;
};

export type BadgeCatalogResponse = {
  badges: BadgeCatalogEntry[];
};

export type AdminDefiParticipation = {
  id: string;
  title: string;
  description?: string;
  kind: string;
  goalType: string;
  goalValue: number;
  progressValue: number;
  pct: number;
  status: "en_cours" | "termine" | "echoue";
  xpReward: number;
  period: "quotidien" | "hebdomadaire" | "mensuel";
  joinedAt: string;
  completedAt: string | null;
};

export type AdminDefiAvailable = {
  id: string;
  title: string;
  description?: string;
  kind: string;
  goalType: string;
  goalValue: number;
  xpReward: number;
  period: "quotidien" | "hebdomadaire" | "mensuel";
};

export type DefisResponse = {
  enCours: AdminDefiParticipation[];
  disponibles: AdminDefiAvailable[];
  termines: AdminDefiParticipation[];
};

export type DefiKind = "individuel" | "amis" | "clubs";
export type DefiGoalType = "distance" | "nb_courses" | "vitesse" | "custom";

export type DefiCatalogEntry = {
  _id: string;
  title: string;
  description?: string;
  image: { url: string; path: string } | null;
  kind: DefiKind;
  goalType: DefiGoalType;
  goalValue: number;
  conditionConfig: ConditionConfig;
  period: "quotidien" | "hebdomadaire" | "mensuel";
  xpReward: number;
  isActive: boolean;
  createdAt: string;
};

export type DefiCatalogResponse = {
  defis: DefiCatalogEntry[];
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value || null;
}

export async function adminApiRequest<T>(path: string, token: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: typeof data.error === "string" ? data.error : "Erreur serveur.",
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      status: 503,
      error: "Impossible de contacter le serveur backend.",
    };
  }
}
