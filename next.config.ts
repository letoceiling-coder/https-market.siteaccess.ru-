import type { NextConfig } from "next";
import categoryRedirects from "./src/data/category-redirects.json";

const nextConfig: NextConfig = {
  output: "standalone",
  // Old catalog paths from before the move to the Avito category structure.
  redirects() {
    return (categoryRedirects as [string, string][]).map(([from, to]) => ({
      source: `/catalog/${from}`,
      destination: `/catalog/${to}`,
      permanent: true,
    }));
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
