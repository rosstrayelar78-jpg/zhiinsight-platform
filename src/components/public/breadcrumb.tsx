import Link from "next/link";

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="面包屑" className="mb-6 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-slate-950">
            首页
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.href ?? item.label}-${item.label}`} className="flex items-center gap-2">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-slate-950">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
