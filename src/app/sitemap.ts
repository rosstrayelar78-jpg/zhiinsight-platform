import type { MetadataRoute } from "next";
import { query } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

type SlugRow = {
  slug: string;
  updated_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/policies",
    "/cases",
    "/topics",
    "/reports",
    "/about",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
  }));

  try {
    const [policies, cases, topics, reports] = await Promise.all([
      query<SlugRow>("SELECT slug, updated_at FROM policies WHERE status = 'published'"),
      query<SlugRow>("SELECT slug, updated_at FROM cases WHERE status = 'published'"),
      query<SlugRow>("SELECT slug, updated_at FROM topics WHERE status = 'published'"),
      query<SlugRow>("SELECT slug, updated_at FROM reports WHERE status = 'published'"),
    ]);

    return [
      ...staticRoutes,
      ...policies.rows.map((row) => ({
        url: absoluteUrl(`/policies/${row.slug}`),
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      })),
      ...cases.rows.map((row) => ({
        url: absoluteUrl(`/cases/${row.slug}`),
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      })),
      ...topics.rows.map((row) => ({
        url: absoluteUrl(`/topics/${row.slug}`),
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      })),
      ...reports.rows.map((row) => ({
        url: absoluteUrl(`/reports/${row.slug}`),
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      })),
    ];
  } catch {
    return staticRoutes;
  }
}

