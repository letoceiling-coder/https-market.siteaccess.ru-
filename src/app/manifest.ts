import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HELP HOMES",
    short_name: "HELP HOMES",
    description: "Каталог объявлений: жильё, транспорт, работа, услуги и товары.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f1",
    theme_color: "#0d6b57",
    lang: "ru",
  };
}
