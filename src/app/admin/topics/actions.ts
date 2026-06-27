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

async function syncRelations(topicId: string, formData: FormData) {
  await query("DELETE FROM topic_relations WHERE topic_id = $1", [topicId]);
  let order = 0;
  for (const type of ["policy", "case", "report"]) {
    for (const id of formData.getAll(`${type}_ids`).map(String)) {
      await query(
        `
        INSERT INTO topic_relations (topic_id, content_type, content_id, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        `,
        [topicId, type, id, order++],
      );
    }
  }
}

export async function createTopic(formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const result = await query<{ id: string }>(
    `
    INSERT INTO topics (title, slug, summary, content, cover_image, status, seo_title, seo_description, published_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8, CASE WHEN $6 = 'published' THEN now() ELSE NULL END)
    RETURNING id
    `,
    [
      title,
      normalizeSlug(title, text(formData, "slug") ?? undefined, "topic"),
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "cover_image"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
    ],
  );
  await syncRelations(result.rows[0].id, formData);
  revalidatePath("/");
  revalidatePath("/topics");
  redirect("/admin/topics");
}

export async function updateTopic(id: string, formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  await query(
    `
    UPDATE topics
    SET title=$1, slug=$2, summary=$3, content=$4, cover_image=$5, status=$6,
        seo_title=$7, seo_description=$8,
        published_at = CASE
          WHEN $6 = 'published' AND published_at IS NULL THEN now()
          WHEN $6 = 'draft' THEN NULL
          ELSE published_at
        END,
        updated_at = now()
    WHERE id=$9
    `,
    [
      title,
      normalizeSlug(title, text(formData, "slug") ?? undefined, "topic"),
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "cover_image"),
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
      id,
    ],
  );
  await syncRelations(id, formData);
  revalidatePath("/");
  revalidatePath("/topics");
  redirect("/admin/topics");
}

export async function setTopicStatus(id: string, status: "draft" | "published") {
  await requireAdminSession();
  await query(
    "UPDATE topics SET status=$1, published_at=CASE WHEN $1='published' THEN COALESCE(published_at, now()) ELSE NULL END, updated_at=now() WHERE id=$2",
    [status, id],
  );
  revalidatePath("/");
  revalidatePath("/topics");
}

export async function deleteTopic(id: string) {
  await requireAdminSession();
  await query("DELETE FROM topic_relations WHERE topic_id=$1", [id]);
  await query("DELETE FROM topics WHERE id=$1", [id]);
  revalidatePath("/");
  revalidatePath("/topics");
}
