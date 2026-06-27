import { ContentCard } from "@/components/public/content-card";
import { Pagination } from "@/components/public/filters";
import { PublicShell } from "@/components/public/public-shell";
import { listReports } from "@/lib/content";

export const metadata = {
  title: "研究报告",
  description: "银发经济政策、产业、城市与投资研究报告库。",
  alternates: { canonical: "/reports" },
  openGraph: {
    title: "研究报告",
    description: "银发经济政策、产业、城市与投资研究报告库。",
    url: "/reports",
  },
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  let result;
  try {
    result = await listReports(Number(params.page ?? 1));
  } catch {
    result = { items: [], total: 0, page: 1, totalPages: 1 };
  }

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-medium text-teal-700">Research Reports</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">研究报告</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            汇集银发经济政策研判、产业地图、利润模型与专题研究成果。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {result.items.map((item) => (
            <ContentCard
              key={item.id}
              href={`/reports/${item.slug}`}
              title={item.title}
              meta={item.publish_date ?? undefined}
              summary={item.summary}
            />
          ))}
        </div>
        {!result.items.length ? (
          <p className="rounded-md bg-white p-5 text-sm text-slate-500">暂无已发布报告。</p>
        ) : null}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          makeHref={(page) => `/reports${page > 1 ? `?page=${page}` : ""}`}
        />
      </section>
    </PublicShell>
  );
}
