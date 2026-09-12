import type { MetadataRoute } from "next";
import { posts } from "@/data/blog";
import { termos } from "@/data/glossario";

const BASE = "https://www.lipeexplica.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/50dinamicas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/glossario`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/videos`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/sobre`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const glossarioEntries: MetadataRoute.Sitemap = termos.map((t) => ({
    url: `${BASE}/glossario/${t.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...statics, ...blogEntries, ...glossarioEntries];
}
