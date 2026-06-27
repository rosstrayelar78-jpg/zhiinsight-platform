import { ContentCard } from "@/components/public/content-card";
import { FilterSelect, Pagination } from "@/components/public/filters";
import { PublicShell } from "@/components/public/public-shell";
import { getRegions, getTags, listCases, type CaseStudy, type Paginated, type Region, type Tag } from "@/lib/content";

const caseTypes = [
  "养老护理服务运营商",
  "保险集团+养老运营综合",
  "国家制度基础设施",
  "商业保险+健康管理",
  "保险系养老社区龙头",
  "居家护理龙头",
  "国企物业+专业运营",
  "科技+供应链模式",
  "智慧养老科技",
  "康养旅居",
  "产业园/体验中心",
];

export const metadata = {
  title: "案例库",
  description: "银发经济产业案例、养老服务运营案例、养老科技和产业平台案例库。",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "案例库",
    description: "银发经济产业案例、养老服务运营案例、养老科技和产业平台案例库。",
    url: "/cases",
  },
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; type?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  let regions: Region[] = [];
  let tags: Tag[] = [];
  let result: Paginated<CaseStudy>;

  try {
    [regions, tags, result] = await Promise.all([
      getRegions(),
      getTags("case"),
      listCases({
        regionId: params.region,
        caseType: params.type,
        tagId: params.tag,
        page,
      }),
    ]);
  } catch {
    result = { items: [], total: 0, page: 1, totalPages: 1 };
  }

  const makeHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.region) query.set("region", params.region);
    if (params.type) query.set("type", params.type);
    if (params.tag) query.set("tag", params.tag);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return `/cases${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-sm font-medium text-teal-700">Case Database</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">案例库</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            沉淀银发经济产业案例，覆盖养老服务、保险支付、科技平台、产业园与国际标杆。
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
          <FilterSelect
            name="type"
            label="案例类型"
            value={params.type}
            options={caseTypes.map((type) => ({ value: type, label: type }))}
          />
          <FilterSelect
            name="tag"
            label="标签"
            value={params.tag}
            options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
          />
          <div className="flex items-end">
            <button className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              筛选
            </button>
          </div>
        </form>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.items.map((item) => (
            <ContentCard
              key={item.id}
              href={`/cases/${item.slug}`}
              title={item.title}
              meta={[item.region_name, item.case_type, item.industry].filter(Boolean).join(" · ")}
              summary={item.summary}
            />
          ))}
        </div>
        {!result.items.length ? (
          <p className="mt-6 rounded-md bg-white p-5 text-sm text-slate-500">暂无已发布案例。</p>
        ) : null}
        <Pagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
      </section>
    </PublicShell>
  );
}
