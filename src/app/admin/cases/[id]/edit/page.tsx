import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCase } from "@/app/admin/cases/actions";
import { CaseForm } from "@/app/admin/cases/case-form";
import { getCaseById, getCaseTagIds, getRegions, getTags } from "@/lib/content";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [caseStudy, regions, tags, selectedTagIds] = await Promise.all([
    getCaseById(id),
    getRegions(),
    getTags("case"),
    getCaseTagIds(id),
  ]);
  if (!caseStudy) notFound();

  return (
    <section>
      <Link href="/admin/cases" className="text-sm text-slate-500 hover:text-slate-950">
        返回案例管理
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">编辑案例</h1>
      <div className="mt-6">
        <CaseForm
          action={updateCase.bind(null, caseStudy.id)}
          caseStudy={caseStudy}
          regions={regions}
          tags={tags}
          selectedTagIds={selectedTagIds}
        />
      </div>
    </section>
  );
}
