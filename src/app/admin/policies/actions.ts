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

export async function createPolicy(formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const slug = normalizeSlug(title, text(formData, "slug") ?? undefined, "policy");

  await query(
    `
    INSERT INTO policies (
      title, slug, summary, content, issuing_authority, region_id, policy_level,
      publish_date, source_url, status, seo_title, seo_description, published_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, CASE WHEN $10 = 'published' THEN now() ELSE NULL END)
    `,
    [
      title,
      slug,
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "issuing_authority"),
      text(formData, "region_id"),
      text(formData, "policy_level"),
      text(formData, "publish_date"),
      text(formData, "source_url"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
    ],
  );

  revalidatePath("/");
  revalidatePath("/policies");
  redirect("/admin/policies");
}

export async function updatePolicy(id: string, formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const slug = normalizeSlug(title, text(formData, "slug") ?? undefined, "policy");

  await query(
    `
    UPDATE policies
    SET title = $1,
        slug = $2,
        summary = $3,
        content = $4,
        issuing_authority = $5,
        region_id = $6,
        policy_level = $7,
        publish_date = $8,
        source_url = $9,
        status = $10,
        seo_title = $11,
        seo_description = $12,
        published_at = CASE
          WHEN $10 = 'published' AND published_at IS NULL THEN now()
          WHEN $10 = 'draft' THEN NULL
          ELSE published_at
        END,
        updated_at = now()
    WHERE id = $13
    `,
    [
      title,
      slug,
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "issuing_authority"),
      text(formData, "region_id"),
      text(formData, "policy_level"),
      text(formData, "publish_date"),
      text(formData, "source_url"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
      id,
    ],
  );

  revalidatePath("/");
  revalidatePath("/policies");
  redirect("/admin/policies");
}

export async function setPolicyStatus(id: string, status: "draft" | "published") {
  await requireAdminSession();
  await query(
    `
    UPDATE policies
    SET status = $1,
        published_at = CASE WHEN $1 = 'published' THEN COALESCE(published_at, now()) ELSE NULL END,
        updated_at = now()
    WHERE id = $2
    `,
    [status, id],
  );
  revalidatePath("/");
  revalidatePath("/policies");
}

export async function deletePolicy(id: string) {
  await requireAdminSession();
  await query("DELETE FROM policies WHERE id = $1", [id]);
  revalidatePath("/");
  revalidatePath("/policies");
}
