import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/login",
          "/dashboard",
          "/library",
          "/books",
          "/obrigado",
          "/convite",
        ],
      },
    ],
    sitemap: "https://www.lipeexplica.com/sitemap.xml",
  };
}
