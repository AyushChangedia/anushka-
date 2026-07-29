import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal collections and API endpoints have nothing worth indexing.
      disallow: ["/api/", "/saved", "/shopping-list"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
