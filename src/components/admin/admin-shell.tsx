import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/policies", label: "政策管理" },
  { href: "/admin/cases", label: "案例管理" },
  { href: "/admin/topics", label: "专题管理" },
  { href: "/admin/reports", label: "报告管理" },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 md:block">
        <Link href="/admin" className="block">
          <span className="text-lg font-semibold">SERI 后台</span>
          <span className="mt-1 block text-xs text-slate-500">内容管理控制台</span>
        </Link>
        <nav className="mt-8 grid gap-1 text-sm">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-sm text-slate-500">当前管理员</p>
            <p className="font-medium">{username}</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
              退出登录
            </button>
          </form>
        </header>
        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
