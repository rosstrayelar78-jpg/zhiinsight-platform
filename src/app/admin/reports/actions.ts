"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { normalizeSlug } from "@/lib/content";
import { requireAdminSession } from "@/lib/auth";

const maxFileSize = 20 * 1024 * 1024;

function text(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

async function savePdf(formData: FormData) {
  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.type !== "application/pdf") throw new Error("仅允许上传 PDF 文件");
  if (file.size > maxFileSize) throw new Error("文件大小不能超过 20MB");

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomUUID()}.pdf`;
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const result = await query<{ id: string }>(
    `
    INSERT INTO files (filename, original_name, mime_type, size, storage_path)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id
    `,
    [filename, file.name, file.type, file.size, `uploads/${filename}`],
  );
  return result.rows[0].id;
}

export async function createReport(formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const fileId = await savePdf(formData);
  await query(
    `
    INSERT INTO reports (
      title, slug, summary, content, publisher, publish_date, file_id,
      is_downloadable, status, seo_title, seo_description, published_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $9='published' THEN now() ELSE NULL END)
    `,
    [
      title,
      normalizeSlug(title, text(formData, "slug") ?? undefined, "report"),
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "publisher"),
      text(formData, "publish_date"),
      fileId,
      formData.get("is_downloadable") === "on",
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
    ],
  );
  revalidatePath("/");
  revalidatePath("/reports");
  redirect("/admin/reports");
}

export async function updateReport(id: string, formData: FormData) {
  await requireAdminSession();
  const title = text(formData, "title");
  if (!title) throw new Error("标题不能为空");
  const status = text(formData, "status") ?? "draft";
  const fileId = await savePdf(formData);
  await query(
    `
    UPDATE reports
    SET title=$1, slug=$2, summary=$3, content=$4, publisher=$5, publish_date=$6,
        file_id=COALESCE($7, file_id), is_downloadable=$8, status=$9,
        seo_title=$10, seo_description=$11,
        published_at=CASE
          WHEN $9='published' AND published_at IS NULL THEN now()
          WHEN $9='draft' THEN NULL
          ELSE published_at
        END,
        updated_at=now()
    WHERE id=$12
    `,
    [
      title,
      normalizeSlug(title, text(formData, "slug") ?? undefined, "report"),
      text(formData, "summary"),
      text(formData, "content"),
      text(formData, "publisher"),
      text(formData, "publish_date"),
      fileId,
      formData.get("is_downloadable") === "on",
      status,
      text(formData, "seo_title"),
      text(formData, "seo_description"),
      id,
    ],
  );
  revalidatePath("/");
  revalidatePath("/reports");
  redirect("/admin/reports");
}

export async function setReportStatus(id: string, status: "draft" | "published") {
  await requireAdminSession();
  await query(
    "UPDATE reports SET status=$1, published_at=CASE WHEN $1='published' THEN COALESCE(published_at, now()) ELSE NULL END, updated_at=now() WHERE id=$2",
    [status, id],
  );
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function deleteReport(id: string) {
  await requireAdminSession();
  await query("DELETE FROM reports WHERE id=$1", [id]);
  revalidatePath("/");
  revalidatePath("/reports");
}
