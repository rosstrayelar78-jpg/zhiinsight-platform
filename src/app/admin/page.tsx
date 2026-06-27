export default function AdminDashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">仪表盘</h1>
      <p className="mt-2 text-slate-600">Sprint 0 空页面。后续将展示内容数量与运营概览。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {["政策", "案例", "专题", "报告"].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{item}</p>
            <p className="mt-2 text-3xl font-semibold">0</p>
          </div>
        ))}
      </div>
    </section>
  );
}
