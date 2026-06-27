import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

const allowedTypes = new Set(["application/pdf"]);
const maxFileSize = 20 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdminSession();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少上传文件。" }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "仅允许上传 PDF 文件。" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "文件大小不能超过 20MB。" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, bytes);

  const result = await query<{ id: string }>(
    `
    INSERT INTO files (filename, original_name, mime_type, size, storage_path)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [filename, file.name, file.type, file.size, `uploads/${filename}`],
  );

  return NextResponse.json({
    id: result.rows[0].id,
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    storagePath: `uploads/${filename}`,
  });
}
