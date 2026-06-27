"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { normalizeSlug } from "@/lib/content";
import { requireAdminSession } from "@/lib/auth";

function text(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

async function syncCaseTags(caseId: string, formData: FormData) {
  const tagIds = formData.getAll("tag_ids").map((value) => String(value));
  await query("DELETE FROM content_tags WHERE content_type = 'case' AND content_id = $1", [caseId]);
  for (const tagId of tagIds) {
    await query(
      `
      INSERT INTO content_tags (content_type, content_id, tag_id)
      VALUES ('case', $1, $2)
      ON CONFLICT DO NOTHING
      `,
      [caseId, tagId],
    );
  }
}

export async function createCase(formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const slug = normalizeSlug(title, text(formData, "slug") ?? undefined, "case");

  const result = await query<{ id: string }>(
    `
    INSERT INTO cases (
      title, slug, summary, content, region_id, case_type, industry,
      status, seo_title, seo_description, published_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CASE WHEN $8 = 'published' THEN now() ELSE NULL END)
    RETURNING id
    `,
    [
      title,
      slug,
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "region_id"),
      text(formData, "case_type"),
      text(formData, "industry"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
    ],
  );

  await syncCaseTags(result.rows[0].id, formData);
  revalidatePath("/");
  revalidatePath("/cases");
  redirect("/admin/cases");
}

export async function updateCase(id: string, formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const slug = normalizeSlug(title, text(formData, "slug") ?? undefined, "case");

  await query(
    `
    UPDATE cases
    SET title = $1,
        slug = $2,
        summary = $3,
        content = $4,
        region_id = $5,
        case_type = $6,
        industry = $7,
        status = $8,
        seo_title = $9,
        seo_description = $10,
        published_at = CASE
          WHEN $8 = 'published' AND published_at IS NULL THEN now()
          WHEN $8 = 'draft' THEN NULL
          ELSE published_at
        END,
        updated_at = now()
    WHERE id = $11
    `,
    [
      title,
      slug,
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "region_id"),
      text(formData, "case_type"),
      text(formData, "industry"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
      id,
    ],
  );

  await syncCaseTags(id, formData);
  revalidatePath("/");
  revalidatePath("/cases");
  redirect("/admin/cases");
}

export async function setCaseStatus(id: string, status: "draft" | "published") {
  await requireAdminSession();
  await query(
    `
    UPDATE cases
    SET status = $1,
        published_at = CASE WHEN $1 = 'published' THEN COALESCE(published_at, now()) ELSE NULL END,
        updated_at = now()
    WHERE id = $2
    `,
    [status, id],
  );
  revalidatePath("/");
  revalidatePath("/cases");
}

export async function deleteCase(id: string) {
  await requireAdminSession();
  await query("DELETE FROM content_tags WHERE content_type = 'case' AND content_id = $1", [id]);
  await query("DELETE FROM cases WHERE id = $1", [id]);
  revalidatePath("/");
  revalidatePath("/cases");
}
