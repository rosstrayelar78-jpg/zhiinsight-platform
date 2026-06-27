import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { PublicShell } from "@/components/public/public-shell";
import { getCaseBySlug } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseBySlug(slug);
  if (!caseStudy) return {};

  return {
    title: caseStudy.seo_title || caseStudy.title,
    description: caseStudy.seo_description || caseStudy.summary || undefined,
    alternates: { canonical: `/cases/${caseStudy.slug}` },
    openGraph: {
      title: caseStudy.seo_title || caseStudy.title,
      description: caseStudy.seo_description || caseStudy.summary || undefined,
      url: absoluteUrl(`/cases/${caseStudy.slug}`),
      type: "article",
    },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseStudy = await getCaseBySlug(slug);
  if (!caseStudy) notFound();

  return (
    <PublicShell>
      <article className="mx-auto max-w-4xl px-5 py-12">
        <Breadcrumb items={[{ label: "案例库", href: "/cases" }, { label: caseStudy.title }]} />
        <p className="text-sm font-medium text-teal-700">
          {[caseStudy.region_name, caseStudy.case_type, caseStudy.industry].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {caseStudy.title}
        </h1>
        {caseStudy.summary ? (
          <p className="mt-8 rounded-lg bg-teal-50 p-5 leading-8 text-slate-700">
            {caseStudy.summary}
          </p>
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-800">
          {caseStudy.content}
        </div>
      </article>
    </PublicShell>
  );
}
