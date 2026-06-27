import { query } from "@/lib/db";
import { createSlug } from "@/lib/slug";

export const pageSize = 10;

export type Region = {
  id: string;
  name: string;
  level: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

export type Policy = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  issuing_authority: string | null;
  region_id: string | null;
  region_name: string | null;
  policy_level: string | null;
  publish_date: string | null;
  source_url: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  region_id: string | null;
  region_name: string | null;
  case_type: string | null;
  industry: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  tags?: Tag[];
};

export type TopicSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content?: string | null;
  cover_image?: string | null;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
  published_at: string | null;
};

export type ReportSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content?: string | null;
  publisher?: string | null;
  publish_date: string | null;
  file_id?: string | null;
  file_original_name?: string | null;
  is_downloadable?: boolean;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
};

export type FileRecord = {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: string;
  storage_path: string;
  public_url: string | null;
  created_at: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type SearchResult = {
  id: string;
  type: "policy" | "case" | "topic" | "report";
  title: string;
  slug: string;
  summary: string | null;
  published_at: string | null;
  publish_date: string | null;
  href: string;
};

export async function getSiteStats() {
  const result = await query<{
    policies: string;
    cases: string;
    topics: string;
    reports: string;
  }>(`
    SELECT
      (SELECT count(*) FROM policies WHERE status = 'published') AS policies,
      (SELECT count(*) FROM cases WHERE status = 'published') AS cases,
      (SELECT count(*) FROM topics WHERE status = 'published') AS topics,
      (SELECT count(*) FROM reports WHERE status = 'published') AS reports
  `);

  const row = result.rows[0];
  return {
    policies: Number(row.policies),
    cases: Number(row.cases),
    topics: Number(row.topics),
    reports: Number(row.reports),
  };
}

export async function getHomeContent() {
  const [stats, policies, cases, topics, reports] = await Promise.all([
    getSiteStats(),
    query<Policy>(
      `
      SELECT p.*, r.name AS region_name
      FROM policies p
      LEFT JOIN regions r ON r.id = p.region_id
      WHERE p.status = 'published'
      ORDER BY p.publish_date DESC NULLS LAST, p.published_at DESC NULLS LAST
      LIMIT 6
      `,
    ),
    query<CaseStudy>(
      `
      SELECT c.*, r.name AS region_name
      FROM cases c
      LEFT JOIN regions r ON r.id = c.region_id
      WHERE c.status = 'published'
      ORDER BY c.published_at DESC NULLS LAST, c.created_at DESC
      LIMIT 6
      `,
    ),
    query<TopicSummary>(
      `
      SELECT id, title, slug, summary, published_at
      FROM topics
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT 4
      `,
    ),
    query<ReportSummary>(
      `
      SELECT id, title, slug, summary, publish_date
      FROM reports
      WHERE status = 'published'
      ORDER BY publish_date DESC NULLS LAST, published_at DESC NULLS LAST
      LIMIT 4
      `,
    ),
  ]);

  return {
    stats,
    policies: policies.rows,
    cases: cases.rows,
    topics: topics.rows,
    reports: reports.rows,
  };
}

export async function getRegions() {
  const result = await query<Region>("SELECT id, name, level FROM regions ORDER BY level, name");
  return result.rows;
}

export async function getTags(type?: string) {
  const params = type ? [type] : [];
  const result = await query<Tag>(
    `SELECT id, name, slug, type FROM tags ${type ? "WHERE type = $1" : ""} ORDER BY name`,
    params,
  );
  return result.rows;
}

export async function listPolicies(filters: {
  status?: "published" | "draft";
  regionId?: string;
  policyLevel?: string;
  year?: string;
  page?: number;
  includeDrafts?: boolean;
}): Promise<Paginated<Policy>> {
  const page = Math.max(filters.page ?? 1, 1);
  const params: unknown[] = [];
  const where: string[] = [];

  if (!filters.includeDrafts) {
    params.push(filters.status ?? "published");
    where.push(`p.status = $${params.length}`);
  }
  if (filters.regionId) {
    params.push(filters.regionId);
    where.push(`p.region_id = $${params.length}`);
  }
  if (filters.policyLevel) {
    params.push(filters.policyLevel);
    where.push(`p.policy_level = $${params.length}`);
  }
  if (filters.year) {
    params.push(`${filters.year}-01-01`, `${filters.year}-12-31`);
    where.push(`p.publish_date BETWEEN $${params.length - 1} AND $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const countResult = await query<{ count: string }>(
    `SELECT count(*) FROM policies p ${whereSql}`,
    params,
  );
  const total = Number(countResult.rows[0].count);

  params.push(pageSize, (page - 1) * pageSize);
  const result = await query<Policy>(
    `
    SELECT p.*, r.name AS region_name
    FROM policies p
    LEFT JOIN regions r ON r.id = p.region_id
    ${whereSql}
    ORDER BY p.publish_date DESC NULLS LAST, p.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );

  return {
    items: result.rows,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getPolicyBySlug(slug: string) {
  const result = await query<Policy>(
    `
    SELECT p.*, r.name AS region_name
    FROM policies p
    LEFT JOIN regions r ON r.id = p.region_id
    WHERE p.slug = $1 AND p.status = 'published'
    LIMIT 1
    `,
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function getPolicyById(id: string) {
  const result = await query<Policy>(
    `
    SELECT p.*, r.name AS region_name
    FROM policies p
    LEFT JOIN regions r ON r.id = p.region_id
    WHERE p.id = $1
    LIMIT 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function listCases(filters: {
  status?: "published" | "draft";
  regionId?: string;
  caseType?: string;
  tagId?: string;
  page?: number;
  includeDrafts?: boolean;
}): Promise<Paginated<CaseStudy>> {
  const page = Math.max(filters.page ?? 1, 1);
  const params: unknown[] = [];
  const where: string[] = [];
  let tagJoin = "";

  if (!filters.includeDrafts) {
    params.push(filters.status ?? "published");
    where.push(`c.status = $${params.length}`);
  }
  if (filters.regionId) {
    params.push(filters.regionId);
    where.push(`c.region_id = $${params.length}`);
  }
  if (filters.caseType) {
    params.push(filters.caseType);
    where.push(`c.case_type = $${params.length}`);
  }
  if (filters.tagId) {
    tagJoin = "JOIN content_tags ct ON ct.content_id = c.id AND ct.content_type = 'case'";
    params.push(filters.tagId);
    where.push(`ct.tag_id = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const countResult = await query<{ count: string }>(
    `SELECT count(DISTINCT c.id) FROM cases c ${tagJoin} ${whereSql}`,
    params,
  );
  const total = Number(countResult.rows[0].count);

  params.push(pageSize, (page - 1) * pageSize);
  const result = await query<CaseStudy>(
    `
    SELECT DISTINCT c.*, r.name AS region_name
    FROM cases c
    LEFT JOIN regions r ON r.id = c.region_id
    ${tagJoin}
    ${whereSql}
    ORDER BY c.published_at DESC NULLS LAST, c.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `,
    params,
  );

  return {
    items: result.rows,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getCaseBySlug(slug: string) {
  const result = await query<CaseStudy>(
    `
    SELECT c.*, r.name AS region_name
    FROM cases c
    LEFT JOIN regions r ON r.id = c.region_id
    WHERE c.slug = $1 AND c.status = 'published'
    LIMIT 1
    `,
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function getCaseById(id: string) {
  const result = await query<CaseStudy>(
    `
    SELECT c.*, r.name AS region_name
    FROM cases c
    LEFT JOIN regions r ON r.id = c.region_id
    WHERE c.id = $1
    LIMIT 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getCaseTagIds(id: string) {
  const result = await query<{ tag_id: string }>(
    "SELECT tag_id FROM content_tags WHERE content_type = 'case' AND content_id = $1",
    [id],
  );
  return result.rows.map((row) => row.tag_id);
}

export async function listAdminPolicies() {
  const result = await query<Policy>(
    `
    SELECT p.*, r.name AS region_name
    FROM policies p
    LEFT JOIN regions r ON r.id = p.region_id
    ORDER BY p.created_at DESC
    LIMIT 100
    `,
  );
  return result.rows;
}

export async function listAdminCases() {
  const result = await query<CaseStudy>(
    `
    SELECT c.*, r.name AS region_name
    FROM cases c
    LEFT JOIN regions r ON r.id = c.region_id
    ORDER BY c.created_at DESC
    LIMIT 100
    `,
  );
  return result.rows;
}

export async function listTopics(page = 1): Promise<Paginated<TopicSummary>> {
  const safePage = Math.max(page, 1);
  const countResult = await query<{ count: string }>(
    "SELECT count(*) FROM topics WHERE status = 'published'",
  );
  const total = Number(countResult.rows[0].count);
  const result = await query<TopicSummary>(
    `
    SELECT id, title, slug, summary, content, cover_image, status, seo_title, seo_description, published_at
    FROM topics
    WHERE status = 'published'
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [pageSize, (safePage - 1) * pageSize],
  );

  return {
    items: result.rows,
    total,
    page: safePage,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getTopicBySlug(slug: string) {
  const result = await query<TopicSummary>(
    `
    SELECT id, title, slug, summary, content, cover_image, status, seo_title, seo_description, published_at
    FROM topics
    WHERE slug = $1 AND status = 'published'
    LIMIT 1
    `,
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function getTopicById(id: string) {
  const result = await query<TopicSummary>(
    `
    SELECT id, title, slug, summary, content, cover_image, status, seo_title, seo_description, created_at, updated_at, published_at
    FROM topics
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function listAdminTopics() {
  const result = await query<TopicSummary>(
    `
    SELECT id, title, slug, summary, content, cover_image, status, seo_title, seo_description, created_at, updated_at, published_at
    FROM topics
    ORDER BY created_at DESC
    LIMIT 100
    `,
  );
  return result.rows;
}

export async function getTopicRelations(topicId: string) {
  const [policies, cases, reports] = await Promise.all([
    query<Policy>(
      `
      SELECT p.*, r.name AS region_name
      FROM topic_relations tr
      JOIN policies p ON p.id = tr.content_id AND tr.content_type = 'policy'
      LEFT JOIN regions r ON r.id = p.region_id
      WHERE tr.topic_id = $1 AND p.status = 'published'
      ORDER BY tr.sort_order, p.publish_date DESC NULLS LAST
      `,
      [topicId],
    ),
    query<CaseStudy>(
      `
      SELECT c.*, r.name AS region_name
      FROM topic_relations tr
      JOIN cases c ON c.id = tr.content_id AND tr.content_type = 'case'
      LEFT JOIN regions r ON r.id = c.region_id
      WHERE tr.topic_id = $1 AND c.status = 'published'
      ORDER BY tr.sort_order, c.created_at DESC
      `,
      [topicId],
    ),
    query<ReportSummary>(
      `
      SELECT rp.id, rp.title, rp.slug, rp.summary, rp.publish_date
      FROM topic_relations tr
      JOIN reports rp ON rp.id = tr.content_id AND tr.content_type = 'report'
      WHERE tr.topic_id = $1 AND rp.status = 'published'
      ORDER BY tr.sort_order, rp.publish_date DESC NULLS LAST
      `,
      [topicId],
    ),
  ]);

  return { policies: policies.rows, cases: cases.rows, reports: reports.rows };
}

export async function getTopicRelationIds(topicId: string) {
  const result = await query<{ content_type: string; content_id: string }>(
    "SELECT content_type, content_id FROM topic_relations WHERE topic_id = $1",
    [topicId],
  );
  return result.rows;
}

export async function listReports(page = 1): Promise<Paginated<ReportSummary>> {
  const safePage = Math.max(page, 1);
  const countResult = await query<{ count: string }>(
    "SELECT count(*) FROM reports WHERE status = 'published'",
  );
  const total = Number(countResult.rows[0].count);
  const result = await query<ReportSummary>(
    `
    SELECT r.*, f.original_name AS file_original_name
    FROM reports r
    LEFT JOIN files f ON f.id = r.file_id
    WHERE r.status = 'published'
    ORDER BY r.publish_date DESC NULLS LAST, r.published_at DESC NULLS LAST
    LIMIT $1 OFFSET $2
    `,
    [pageSize, (safePage - 1) * pageSize],
  );
  return {
    items: result.rows,
    total,
    page: safePage,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getReportBySlug(slug: string) {
  const result = await query<ReportSummary>(
    `
    SELECT r.*, f.original_name AS file_original_name
    FROM reports r
    LEFT JOIN files f ON f.id = r.file_id
    WHERE r.slug = $1 AND r.status = 'published'
    LIMIT 1
    `,
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function getReportById(id: string) {
  const result = await query<ReportSummary>(
    `
    SELECT r.*, f.original_name AS file_original_name
    FROM reports r
    LEFT JOIN files f ON f.id = r.file_id
    WHERE r.id = $1
    LIMIT 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function listAdminReports() {
  const result = await query<ReportSummary>(
    `
    SELECT r.*, f.original_name AS file_original_name
    FROM reports r
    LEFT JOIN files f ON f.id = r.file_id
    ORDER BY r.created_at DESC
    LIMIT 100
    `,
  );
  return result.rows;
}

export async function getDownloadableFileForReport(fileId: string) {
  const result = await query<FileRecord>(
    `
    SELECT f.*
    FROM files f
    JOIN reports r ON r.file_id = f.id
    WHERE f.id = $1 AND r.status = 'published' AND r.is_downloadable = true
    LIMIT 1
    `,
    [fileId],
  );
  return result.rows[0] ?? null;
}

export async function listPublishedContentForRelations() {
  const [policies, cases, reports] = await Promise.all([
    query<Policy>(
      "SELECT id, title, slug, summary, content, issuing_authority, region_id, NULL AS region_name, policy_level, publish_date, source_url, status, seo_title, seo_description, created_at, updated_at, published_at FROM policies WHERE status = 'published' ORDER BY publish_date DESC NULLS LAST, created_at DESC LIMIT 200",
    ),
    query<CaseStudy>(
      "SELECT id, title, slug, summary, content, region_id, NULL AS region_name, case_type, industry, status, seo_title, seo_description, created_at, updated_at, published_at FROM cases WHERE status = 'published' ORDER BY created_at DESC LIMIT 200",
    ),
    query<ReportSummary>(
      "SELECT id, title, slug, summary, publish_date FROM reports WHERE status = 'published' ORDER BY publish_date DESC NULLS LAST, created_at DESC LIMIT 200",
    ),
  ]);
  return { policies: policies.rows, cases: cases.rows, reports: reports.rows };
}

export async function searchContent(keyword: string, page = 1): Promise<Paginated<SearchResult>> {
  const q = keyword.trim();
  const safePage = Math.max(page, 1);
  if (!q) {
    return { items: [], total: 0, page: safePage, totalPages: 1 };
  }

  const pattern = `%${q}%`;
  const params = [pattern];
  const baseSql = `
    SELECT id, 'policy'::text AS type, title, slug, summary, published_at, publish_date,
           '/policies/' || slug AS href
    FROM policies
    WHERE status = 'published' AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
    UNION ALL
    SELECT id, 'case'::text AS type, title, slug, summary, published_at, NULL::date AS publish_date,
           '/cases/' || slug AS href
    FROM cases
    WHERE status = 'published' AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
    UNION ALL
    SELECT id, 'topic'::text AS type, title, slug, summary, published_at, NULL::date AS publish_date,
           '/topics/' || slug AS href
    FROM topics
    WHERE status = 'published' AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
    UNION ALL
    SELECT id, 'report'::text AS type, title, slug, summary, published_at, publish_date,
           '/reports/' || slug AS href
    FROM reports
    WHERE status = 'published' AND (title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1)
  `;

  const countResult = await query<{ count: string }>(`SELECT count(*) FROM (${baseSql}) s`, params);
  const total = Number(countResult.rows[0].count);
  const result = await query<SearchResult>(
    `
    SELECT * FROM (${baseSql}) s
    ORDER BY publish_date DESC NULLS LAST, published_at DESC NULLS LAST, title ASC
    LIMIT $2 OFFSET $3
    `,
    [pattern, pageSize, (safePage - 1) * pageSize],
  );

  return {
    items: result.rows,
    total,
    page: safePage,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export function normalizeSlug(title: string, slug?: string, fallback?: string) {
  return slug?.trim() || createSlug(title, fallback);
}
