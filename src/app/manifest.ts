import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HELP HOMES",
    short_name: "HELP HOMES",
    description: "Каталог объявлений: жильё, транспорт, работа, услуги и товары.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f3f5",
    theme_color: "#0a6cff",
    lang: "ru",
  };
}
