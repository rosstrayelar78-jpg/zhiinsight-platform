import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getDownloadableFileForReport } from "@/lib/content";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getDownloadableFileForReport(id);
  if (!file) {
    return NextResponse.json({ error: "文件不存在或未开放下载。" }, { status: 404 });
  }

  if (!file.storage_path.startsWith("uploads/")) {
    return NextResponse.json({ error: "文件路径无效。" }, { status: 400 });
  }

  const absolutePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "uploads",
    path.basename(file.storage_path),
  );
  const bytes = await readFile(absolutePath);
  const encodedName = encodeURIComponent(file.original_name);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": file.mime_type,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
    },
  });
}
