import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Améthyste — Hair Botox & soins capillaires",
    short_name: "Améthyste",
    description: BRAND.description.fr,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND.themeColor,
    lang: "fr-CA",
    categories: ["shopping", "beauty", "lifestyle"],
    icons: [
      { src: "/logo.jpeg", sizes: "any", type: "image/jpeg" },
    ],
  };
}
