import Link from "next/link";
import { ContentCard } from "@/components/public/content-card";
import { PublicShell } from "@/components/public/public-shell";
import { getHomeContent } from "@/lib/content";

const quickLinks = [
  { href: "/policies", label: "政策库", desc: "追踪国家与地方银发经济政策" },
  { href: "/cases", label: "案例库", desc: "沉淀可复用的产业实践案例" },
  { href: "/topics", label: "产业专题", desc: "围绕细分赛道组织研究内容" },
  { href: "/reports", label: "研究报告", desc: "管理与发布专题研究成果" },
];

export default async function HomePage() {
  let home;
  let error = false;
  try {
    home = await getHomeContent();
  } catch {
    error = true;
    home = {
      stats: { policies: 0, cases: 0, topics: 0, reports: 0 },
      policies: [],
      cases: [],
      topics: [],
      reports: [],
    };
  }

  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_45%,#ecfdf5_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold tracking-wide text-teal-700">
              Silver Economy Research Institute
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              AI 驱动的中国银发经济产业研究平台
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              面向政府、园区、国企、康养集团、投资机构与研究机构，持续沉淀政策、案例、专题和研究报告。
            </p>
            <form action="/search" className="mt-8 flex max-w-2xl gap-3">
              <input
                name="q"
                placeholder="搜索政策、案例、专题或报告"
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
              />
              <button className="rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                搜索
              </button>
            </form>
            {error ? (
              <p className="mt-4 text-sm text-amber-700">
                当前尚未连接数据库；完成迁移和 seed 后将展示真实内容。
              </p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-stone-50 p-5 transition hover:border-teal-700 hover:bg-white"
              >
                <h2 className="text-lg font-semibold">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-4">
        {[
          ["政策数量", home.stats.policies],
          ["案例数量", home.stats.cases],
          ["专题数量", home.stats.topics],
          ["报告数量", home.stats.reports],
        ].map(([label, value]) => (
          <div key={label} className="border-l-2 border-teal-700 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <SectionHeader title="最新政策" href="/policies" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {home.policies.map((item) => (
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
          {!home.policies.length ? <EmptyText text="暂无已发布政策。" /> : null}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12">
        <SectionHeader title="精选案例" href="/cases" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {home.cases.map((item) => (
            <ContentCard
              key={item.id}
              href={`/cases/${item.slug}`}
              title={item.title}
              meta={[item.region_name, item.case_type, item.industry].filter(Boolean).join(" · ")}
              summary={item.summary}
            />
          ))}
        </div>
        {!home.cases.length ? <EmptyText text="暂无已发布案例。" /> : null}
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-2">
          <div>
            <SectionHeader title="产业专题" href="/topics" />
            <div className="mt-6 grid gap-4">
              {home.topics.map((item) => (
                <ContentCard
                  key={item.id}
                  href={`/topics/${item.slug}`}
                  title={item.title}
                  summary={item.summary}
                />
              ))}
              {!home.topics.length ? <EmptyText text="暂无已发布专题。" /> : null}
            </div>
          </div>
          <div>
            <SectionHeader title="研究报告" href="/reports" />
            <div className="mt-6 grid gap-4">
              {home.reports.map((item) => (
                <ContentCard
                  key={item.id}
                  href={`/reports/${item.slug}`}
                  title={item.title}
                  meta={item.publish_date ?? undefined}
                  summary={item.summary}
                />
              ))}
              {!home.reports.length ? <EmptyText text="暂无已发布报告。" /> : null}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-teal-700">SERI Research</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-medium text-teal-700 hover:text-teal-900">
        查看全部
      </Link>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="mt-6 rounded-md bg-stone-50 p-4 text-sm text-slate-500">{text}</p>;
}
