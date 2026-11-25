"use client";

import { useStoredJson } from "@/hooks/storage";

export type ListingDraft = {
  id: string;
  title: string;
  category: string;
  region: string;
  details: string;
  text: string;
  photoId: string;
  updatedAt: string;
  attributes?: Record<string, string>;
  priceNote?: string;
  contactName?: string;
  contactPhone?: string;
};

const KEY = "hh.listings";

export function readListings(): ListingDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDraft);
  } catch {
    return [];
  }
}

export function writeListings(items: ListingDraft[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("hh-storage"));
}

export function upsertListing(draft: ListingDraft) {
  const items = readListings().filter((item) => item.id !== draft.id);
  writeListings([draft, ...items]);
}

export function useListingDrafts() {
  return useStoredJson(KEY, parseDrafts, [] as ListingDraft[]);
}

function parseDrafts(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isDraft) : [];
  } catch {
    return [];
  }
}

function isDraft(value: unknown): value is ListingDraft {
  if (!value || typeof value !== "object") return false;
  const item = value as ListingDraft;
  return typeof item.id === "string" && typeof item.title === "string" && typeof item.text === "string";
}
