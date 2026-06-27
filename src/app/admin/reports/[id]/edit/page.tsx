import Link from "next/link";
import { notFound } from "next/navigation";
import { updateReport } from "@/app/admin/reports/actions";
import { ReportForm } from "@/app/admin/reports/report-form";
import { getReportById } from "@/lib/content";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  return (
    <section>
      <Link href="/admin/reports" className="text-sm text-slate-500 hover:text-slate-950">返回报告管理</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">编辑报告</h1>
      <div className="mt-6">
        <ReportForm action={updateReport.bind(null, report.id)} report={report} />
      </div>
    </section>
  );
}
