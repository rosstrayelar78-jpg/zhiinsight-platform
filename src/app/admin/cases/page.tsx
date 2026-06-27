import Link from "next/link";
import { deleteCase, setCaseStatus } from "@/app/admin/cases/actions";
import { listAdminCases, type CaseStudy } from "@/lib/content";

export default async function AdminCasesPage() {
  let cases: CaseStudy[] = [];
  try {
    cases = await listAdminCases();
  } catch {
    cases = [];
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">案例管理</h1>
          <p className="mt-2 text-slate-600">新增、编辑、发布、下架和删除案例内容。</p>
        </div>
        <Link
          href="/admin/cases/new"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          新增案例
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">地区</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3 text-slate-600">{item.region_name ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{item.case_type ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{item.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-teal-700" href={`/admin/cases/${item.id}/edit`}>
                      编辑
                    </Link>
                    <form action={setCaseStatus.bind(null, item.id, "published")}>
                      <button className="text-teal-700">发布</button>
                    </form>
                    <form action={setCaseStatus.bind(null, item.id, "draft")}>
                      <button className="text-slate-600">下架</button>
                    </form>
                    <form action={deleteCase.bind(null, item.id)}>
                      <button className="text-red-700">删除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cases.length ? <p className="p-5 text-sm text-slate-500">暂无案例内容。</p> : null}
      </div>
    </section>
  );
}
