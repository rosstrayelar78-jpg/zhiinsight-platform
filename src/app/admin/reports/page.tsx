import Link from "next/link";
import { deleteReport, setReportStatus } from "@/app/admin/reports/actions";
import { listAdminReports, type ReportSummary } from "@/lib/content";

export default async function AdminReportsPage() {
  let reports: ReportSummary[] = [];
  try {
    reports = await listAdminReports();
  } catch {
    reports = [];
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">报告管理</h1>
          <p className="mt-2 text-slate-600">新增、编辑、上传 PDF、发布、下架和删除研究报告。</p>
        </div>
        <Link href="/admin/reports/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">新增报告</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="px-4 py-3">标题</th><th className="px-4 py-3">文件</th><th className="px-4 py-3">下载</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">操作</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-4 py-3 font-medium">{report.title}</td>
                <td className="px-4 py-3 text-slate-600">{report.file_original_name ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{report.is_downloadable ? "开放" : "关闭"}</td>
                <td className="px-4 py-3 text-slate-600">{report.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-teal-700" href={`/admin/reports/${report.id}/edit`}>编辑</Link>
                    <form action={setReportStatus.bind(null, report.id, "published")}><button className="text-teal-700">发布</button></form>
                    <form action={setReportStatus.bind(null, report.id, "draft")}><button className="text-slate-600">下架</button></form>
                    <form action={deleteReport.bind(null, report.id)}><button className="text-red-700">删除</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reports.length ? <p className="p-5 text-sm text-slate-500">暂无报告内容。</p> : null}
      </div>
    </section>
  );
}
