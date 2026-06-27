import Link from "next/link";
import { createCase } from "@/app/admin/cases/actions";
import { CaseForm } from "@/app/admin/cases/case-form";
import { getRegions, getTags, type Region, type Tag } from "@/lib/content";

export default async function NewCasePage() {
  let regions: Region[] = [];
  let tags: Tag[] = [];
  try {
    [regions, tags] = await Promise.all([getRegions(), getTags("case")]);
  } catch {
    regions = [];
    tags = [];
  }

  return (
    <section>
      <Link href="/admin/cases" className="text-sm text-slate-500 hover:text-slate-950">
        返回案例管理
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">新增案例</h1>
      <div className="mt-6">
        <CaseForm action={createCase} regions={regions} tags={tags} />
      </div>
    </section>
  );
}
