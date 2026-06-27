import Link from "next/link";

type Option = {
  label: string;
  value: string;
};

export function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Option[];
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-teal-700"
      >
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-between text-sm">
      <Link
        href={makeHref(Math.max(page - 1, 1))}
        aria-disabled={page <= 1}
        className="rounded-md border border-slate-300 px-4 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        上一页
      </Link>
      <span className="text-slate-500">
        第 {page} / {totalPages} 页
      </span>
      <Link
        href={makeHref(Math.min(page + 1, totalPages))}
        aria-disabled={page >= totalPages}
        className="rounded-md border border-slate-300 px-4 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        下一页
      </Link>
    </div>
  );
}

