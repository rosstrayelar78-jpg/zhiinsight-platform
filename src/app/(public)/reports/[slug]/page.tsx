import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { PublicShell } from "@/components/public/public-shell";
import { getReportBySlug } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) return {};
  return {
    title: report.seo_title || report.title,
    description: report.seo_description || report.summary || undefined,
    alternates: { canonical: `/reports/${report.slug}` },
    openGraph: {
      title: report.seo_title || report.title,
      description: report.seo_description || report.summary || undefined,
      url: absoluteUrl(`/reports/${report.slug}`),
      type: "article",
    },
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) notFound();

  return (
    <PublicShell>
      <article className="mx-auto max-w-4xl px-5 py-12">
        <Breadcrumb items={[{ label: "研究报告", href: "/reports" }, { label: report.title }]} />
        <p className="text-sm font-medium text-teal-700">
          {[report.publisher, report.publish_date].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {report.title}
        </h1>
        {report.summary ? (
          <p className="mt-8 rounded-lg bg-teal-50 p-5 leading-8 text-slate-700">{report.summary}</p>
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-800">
          {report.content}
        </div>
        {report.is_downloadable && report.file_id ? (
          <a
            href={`/api/files/${report.file_id}/download`}
            className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            下载报告 PDF
          </a>
        ) : (
          <p className="mt-8 rounded-md bg-stone-100 p-4 text-sm text-slate-500">
            当前报告暂未开放下载。
          </p>
        )}
      </article>
    </PublicShell>
  );
}
