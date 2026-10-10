import type { MetadataRoute } from "next";
import { ACCOUNT_PATH, ADMIN_PATH, NEW_LISTING_PATH } from "@/shared/config/routes";
import { absoluteUrl } from "@/shared/lib/seo";

/** robots.txt: открыт весь сайт, кроме кабинета, админки, API и размещения объявления. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [ACCOUNT_PATH, ADMIN_PATH, "/api/", NEW_LISTING_PATH],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
