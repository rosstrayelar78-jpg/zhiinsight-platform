import Link from "next/link";

export function ContentCard({
  href,
  title,
  meta,
  summary,
}: {
  href: string;
  title: string;
  meta?: string;
  summary?: string | null;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-700 hover:shadow-md"
    >
      {meta ? <p className="mb-3 text-xs font-medium text-teal-700">{meta}</p> : null}
      <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-slate-950">{title}</h3>
      {summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p> : null}
    </Link>
  );
}

