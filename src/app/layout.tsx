import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { BottomNav } from "@/components/site/bottom-nav";
import { NavProgress } from "@/components/site/nav-progress";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getRegions, getSearchIndex } from "@/services/catalog";
import { getDemos, getTaxonChildren, getTaxonRoots } from "@/services/classified";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.siteaccess.ru"),
  title: {
    default: "HELP HOMES — объявления",
    template: "%s — HELP HOMES",
  },
  description:
    "Каталог объявлений: жильё, транспорт, работа, услуги и товары. Живые предложения появляются после модерации.",
  appleWebApp: { capable: true, title: "HELP HOMES", statusBarStyle: "default" },
  openGraph: {
    locale: "ru_RU",
    siteName: "HELP HOMES",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d6b57",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const menu = getTaxonRoots().map((item) => ({
    name: item.name,
    path: item.path,
    icon: item.icon,
    children: getTaxonChildren(item.id).slice(0, 10).map((child) => ({ name: child.name, path: child.path })),
  }));
  const regions = getRegions().map((item) => ({ id: item.id, name: item.name }));
  const index = [
    ...getSearchIndex().map(({ id, type, title, href }) => ({ id, type, title, href, text: title })),
    // Empty unless UI_DEMO_MODE is on, so public pages never suggest demo cards.
    ...getDemos().map((item) => ({
      id: item.id,
      type: "listing" as const,
      title: item.title,
      href: `/samples/${item.slug}`,
      text: item.title,
    })),
  ];

  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2"
        >
          К содержанию
        </a>
        <TooltipProvider>
          <NavProgress />
          <Suspense fallback={<div className="h-16 border-b border-border bg-card" />}>
            <SiteHeader menu={menu} regions={regions} index={index} />
          </Suspense>
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </TooltipProvider>
      </body>
    </html>
  );
}
