import { ContentCard } from "@/components/public/content-card";
import { FilterSelect, Pagination } from "@/components/public/filters";
import { PublicShell } from "@/components/public/public-shell";
import { getRegions, listPolicies, type Paginated, type Policy, type Region } from "@/lib/content";

const policyLevels = [
  { value: "national", label: "国家级" },
  { value: "provincial", label: "省级" },
  { value: "municipal", label: "市级" },
  { value: "district", label: "区县级" },
];

export const metadata = {
  title: "政策库",
  description: "银发经济、养老服务、养老金融、长期护理保险等政策数据库。",
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "政策库",
    description: "银发经济、养老服务、养老金融、长期护理保险等政策数据库。",
    url: "/policies",
  },
};

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; level?: string; year?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  let regions: Region[] = [];
  let result: Paginated<Policy>;

  try {
    [regions, result] = await Promise.all([
      getRegions(),
      listPolicies({
        regionId: params.region,
        policyLevel: params.level,
        year: params.year,
        page,
      }),
    ]);
  } catch {
    result = { items: [], total: 0, page: 1, totalPages: 1 };
  }

  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.region) query.set("region", params.region);
    if (params.level) query.set("level", params.level);
    if (params.year) query.set("year", params.year);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return `/policies${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-medium text-teal-700">Policy Database</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">政策库</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            追踪国家与地方银发经济、养老服务、养老金融和长期护理保险政策。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-4">
          <FilterSelect
            name="region"
            label="地区"
            value={params.region}
            options={regions.map((region) => ({ value: region.id, label: region.name }))}
          />
          <FilterSelect name="level" label="政策层级" value={params.level} options={policyLevels} />
          <FilterSelect
            name="year"
            label="发布时间"
            value={params.year}
            options={["2026", "2025", "2024", "2023"].map((year) => ({
              value: year,
              label: `${year}年`,
            }))}
          />
          <div className="flex items-end">
            <button className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              筛选
            </button>
          </div>
        </form>
        <div className="mt-6 grid gap-4">
          {result.items.map((item) => (
            <ContentCard
              key={item.id}
              href={`/policies/${item.slug}`}
              title={item.title}
              meta={[item.region_name, item.issuing_authority, item.publish_date]
                .filter(Boolean)
                .join(" · ")}
              summary={item.summary}
            />
          ))}
        </div>
        {!result.items.length ? (
          <p className="mt-6 rounded-md bg-white p-5 text-sm text-slate-500">暂无已发布政策。</p>
        ) : null}
        <Pagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
      </section>
    </PublicShell>
  );
}
