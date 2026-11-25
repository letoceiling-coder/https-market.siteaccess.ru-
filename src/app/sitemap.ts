import type { MetadataRoute } from "next";
import { getArticles, getCalculators, getCategories, getCompanies, getProperties, getServices } from "@/services/catalog";
import { getTaxonNodes } from "@/services/classified";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-01");
  const staticRoutes = [
    "",
    "/services",
    "/construction",
    "/properties",
    "/partners",
    "/articles",
    "/calculators",
    "/portfolio",
    "/about",
    "/contacts",
    "/help",
    "/glossary",
    "/favorites",
    "/advertising",
    "/catalog",
    "/search",
    "/messages",
    "/notifications",
    "/map",
    "/account",
    "/account/partner",
    "/account/partner/listings",
    "/account/partner/listings/new",
    "/account/partner/profile",
    "/account/partner/settings",
    "/legal/privacy",
    "/legal/terms",
    "/legal/advertising",
  ].map((path) => ({ url: `https://helphomes.ru${path || "/"}`, lastModified: now }));

  const dynamic = [
    ...getCategories().map((item) => `/services/${item.slug}`),
    ...getServices().map((item) => `/services/${item.categoryId}/${item.slug}`),
    ...getProperties().map((item) => `/properties/${item.slug}`),
    ...getCompanies().map((item) => `/partners/${item.slug}`),
    ...getArticles().map((item) => `/articles/${item.slug}`),
    ...getCalculators().map((item) => `/calculators/${item.slug}`),
    ...getTaxonNodes().map((item) => `/catalog/${item.path}`),
  ].map((path) => ({ url: `https://helphomes.ru${path}`, lastModified: now }));

  return [...staticRoutes, ...dynamic];
}
