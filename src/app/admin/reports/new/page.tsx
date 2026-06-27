import Link from "next/link";
import { createReport } from "@/app/admin/reports/actions";
import { ReportForm } from "@/app/admin/reports/report-form";

export default function NewReportPage() {
  return (
    <section>
      <Link href="/admin/reports" className="text-sm text-slate-500 hover:text-slate-950">返回报告管理</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">新增报告</h1>
      <div className="mt-6">
        <ReportForm action={createReport} />
      </div>
    </section>
  );
}
