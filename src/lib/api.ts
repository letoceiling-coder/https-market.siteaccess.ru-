export type ApiHealth = {
  service: string;
  status: "ok" | "degraded";
  checks: Record<string, boolean>;
};

export type ApiListMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type ApiCategory = {
  id: string | null;
  slug: string | null;
  name: string | null;
  path: string | null;
  parent_id: string | null;
  listing_kind: string | null;
  depth: number | null;
  order: number | null;
  icon: string | null;
};

export type ApiListing = {
  id: number | string | null;
  public_id?: string | null;
  title: string | null;
  slug?: string | null;
  price: number | null;
  currency: string;
  price_suffix?: string | null;
  region: string | null;
  place?: string | null;
  category_id?: string | null;
  category_path?: string | null;
  kind?: string | null;
  status?: string | null;
  published_at?: string | null;
};

function apiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL?.replace(/\/$/, "") || fromEnv || "http://127.0.0.1:8073";
  }
  if (fromEnv) return fromEnv;
  if (window.location.hostname === "avito.rinulik.ru") {
    return "https://avito.rinulik.ru";
  }
  if (window.location.hostname.endsWith("helphomes.ru")) {
    return "https://api.helphomes.ru";
  }
  return "";
}

async function apiGet<T>(path: string): Promise<T | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok && response.status !== 503) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getApiBase() {
  return apiBase();
}

export function fetchApiHealth() {
  return apiGet<{ data: ApiHealth }>("/api/v1/health");
}

export function fetchApiCategories(query?: { parent?: string; path?: string; perPage?: number }) {
  const params = new URLSearchParams();
  if (query?.parent) params.set("parent", query.parent);
  if (query?.path) params.set("path", query.path);
  if (query?.perPage) params.set("per_page", String(query.perPage));
  const suffix = params.size ? `?${params}` : "";
  return apiGet<{ data: ApiCategory[]; meta: ApiListMeta }>(`/api/v1/categories${suffix}`);
}

export function fetchApiListings(query?: { category?: string; q?: string; region?: string; page?: number }) {
  const params = new URLSearchParams();
  if (query?.category) params.set("category", query.category);
  if (query?.q) params.set("q", query.q);
  if (query?.region) params.set("region", query.region);
  if (query?.page) params.set("page", String(query.page));
  const suffix = params.size ? `?${params}` : "";
  return apiGet<{ data: ApiListing[]; meta: ApiListMeta }>(`/api/v1/listings${suffix}`);
}
