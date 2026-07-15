import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { catalogFallback as products } from "@/content/catalog-fallback";

const BASE_URL = "https://evotech.example";

const staticPaths = ["", "/services", "/products", "/pricing", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const product of products) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
