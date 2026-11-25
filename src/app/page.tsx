import { Suspense } from "react";
import { CategoryMosaic } from "@/components/classified/category-mosaic";
import { RegionFeed } from "@/components/classified/region-feed";
import { JsonLd } from "@/components/site/json-ld";
import { PageSkeleton } from "@/components/site/states";
import type { ClassifiedDemo } from "@/domain/classified";
import { getDemos } from "@/services/classified";

const FEED_SIZE = 30;

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Home />
    </Suspense>
  );
}

function Home() {
  const feed = mixFeed(getDemos(), FEED_SIZE);

  return (
    <div className="mx-auto max-w-[1348px] px-3 pt-3 pb-10 sm:px-4 sm:pt-4">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "HELP HOMES",
          url: "https://helphomes.ru",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://helphomes.ru/search?q={query}",
            "query-input": "required name=query",
          },
        }}
      />
      <h1 className="sr-only">Объявления HELP HOMES</h1>
      <CategoryMosaic />
      <RegionFeed items={feed} />
    </div>
  );
}

/** Round-robin by kind so neighbouring cards differ; newest first inside each kind. Deterministic. */
function mixFeed(items: ClassifiedDemo[], size: number) {
  const groups = new Map<string, ClassifiedDemo[]>();
  for (const item of [...items].sort((a, b) => b.postedAt.localeCompare(a.postedAt) || a.slug.localeCompare(b.slug))) {
    groups.set(item.kind, [...(groups.get(item.kind) ?? []), item]);
  }
  const queues = [...groups.values()].sort((a, b) => b.length - a.length);
  const result: ClassifiedDemo[] = [];
  while (result.length < size && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < size) result.push(next);
    }
  }
  return result;
}
