import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/policies", label: "政策库" },
  { href: "/cases", label: "案例库" },
  { href: "/topics", label: "产业专题" },
  { href: "/reports", label: "研究报告" },
  { href: "/about", label: "关于我们" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">知璟银发智库</span>
            <span className="text-xs uppercase text-slate-500">SERI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-700 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-5 pb-4 text-sm text-slate-700 lg:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>知璟银发智库 SERI</p>
          <p>面向政策、产业、企业与城市更新的银发经济研究基础设施。</p>
        </div>
      </footer>
    </div>
  );
}
