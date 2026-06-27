import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/public/filters";
import { PublicShell } from "@/components/public/public-shell";
import { searchContent } from "@/lib/content";

const typeLabels = {
  policy: "政策",
  case: "案例",
  topic: "专题",
  report: "报告",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const keyword = params.q?.trim();
  return {
    title: keyword ? `搜索：${keyword}` : "站内搜索",
    description: keyword
      ? `在知璟银发智库搜索“${keyword}”相关政策、案例、专题和报告。`
      : "搜索知璟银发智库的政策、案例、产业专题和研究报告。",
    robots: keyword ? { index: false, follow: true } : { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";
  const page = Number(params.page ?? 1);
  let result;
  let failed = false;

  try {
    result = await searchContent(keyword, page);
  } catch {
    failed = true;
    result = { items: [], total: 0, page: 1, totalPages: 1 };
  }

  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (keyword) query.set("q", keyword);
    if (nextPage > 1) query.set("page", String(nextPage));
    return `/search?${query.toString()}`;
  };

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:py-12">
          <p className="text-sm font-medium text-teal-700">Search</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">站内搜索</h1>
          <form className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              name="q"
              defaultValue={keyword}
              placeholder="搜索政策、案例、专题或报告"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700"
            />
            <button className="rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              搜索
            </button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        {failed ? (
          <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            搜索服务暂时不可用，请稍后重试。
          </p>
        ) : null}
        {keyword ? (
          <p className="mb-5 text-sm text-slate-500">
            找到 {result.total} 条与“{keyword}”相关的内容。
          </p>
        ) : (
          <p className="rounded-md bg-white p-5 text-sm text-slate-500">
            请输入关键词，搜索政策、案例、产业专题和研究报告。
          </p>
        )}
        <div className="grid gap-4">
          {result.items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-700 hover:shadow-md"
            >
              <p className="text-xs font-medium text-teal-700">
                {typeLabels[item.type]} · {item.publish_date ?? item.published_at ?? "已发布"}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h2>
              {item.summary ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
              ) : null}
              <p className="mt-4 text-sm font-medium text-teal-700">查看详情</p>
            </Link>
          ))}
        </div>
        {keyword && !result.items.length && !failed ? (
          <p className="rounded-md bg-white p-5 text-sm text-slate-500">
            暂无匹配结果，请尝试更短或更通用的关键词。
          </p>
        ) : null}
        <Pagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
      </section>
    </PublicShell>
  );
}
