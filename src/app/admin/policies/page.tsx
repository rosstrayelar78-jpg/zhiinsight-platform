import Link from "next/link";
import { deletePolicy, setPolicyStatus } from "@/app/admin/policies/actions";
import { listAdminPolicies, type Policy } from "@/lib/content";

export default async function AdminPoliciesPage() {
  let policies: Policy[] = [];
  try {
    policies = await listAdminPolicies();
  } catch {
    policies = [];
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">政策管理</h1>
          <p className="mt-2 text-slate-600">新增、编辑、发布、下架和删除政策内容。</p>
        </div>
        <Link
          href="/admin/policies/new"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          新增政策
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">地区</th>
              <th className="px-4 py-3">层级</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td className="px-4 py-3 font-medium">{policy.title}</td>
                <td className="px-4 py-3 text-slate-600">{policy.region_name ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{policy.policy_level ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{policy.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-teal-700" href={`/admin/policies/${policy.id}/edit`}>
                      编辑
                    </Link>
                    <form action={setPolicyStatus.bind(null, policy.id, "published")}>
                      <button className="text-teal-700">发布</button>
                    </form>
                    <form action={setPolicyStatus.bind(null, policy.id, "draft")}>
                      <button className="text-slate-600">下架</button>
                    </form>
                    <form action={deletePolicy.bind(null, policy.id)}>
                      <button className="text-red-700">删除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!policies.length ? <p className="p-5 text-sm text-slate-500">暂无政策内容。</p> : null}
      </div>
    </section>
  );
}
