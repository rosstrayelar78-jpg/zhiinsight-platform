import { ContentCard } from "@/components/public/content-card";
import { Pagination } from "@/components/public/filters";
import { PublicShell } from "@/components/public/public-shell";
import { listTopics } from "@/lib/content";

export const metadata = {
  title: "产业专题",
  description: "围绕长护险、照护师、养老科技、服务认证、产业园等方向的银发经济专题研究。",
  alternates: { canonical: "/topics" },
  openGraph: {
    title: "产业专题",
    description: "围绕长护险、照护师、养老科技、服务认证、产业园等方向的银发经济专题研究。",
    url: "/topics",
  },
};

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  let result;
  try {
    result = await listTopics(Number(params.page ?? 1));
  } catch {
    result = { items: [], total: 0, page: 1, totalPages: 1 };
  }

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-medium text-teal-700">Industry Topics</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">产业专题</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            将政策、案例与研究报告组织为专题，形成可持续更新的银发经济研究框架。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {result.items.map((item) => (
            <ContentCard
              key={item.id}
              href={`/topics/${item.slug}`}
              title={item.title}
              summary={item.summary}
            />
          ))}
        </div>
        {!result.items.length ? (
          <p className="rounded-md bg-white p-5 text-sm text-slate-500">暂无已发布专题。</p>
        ) : null}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          makeHref={(page) => `/topics${page > 1 ? `?page=${page}` : ""}`}
        />
      </section>
    </PublicShell>
  );
}
