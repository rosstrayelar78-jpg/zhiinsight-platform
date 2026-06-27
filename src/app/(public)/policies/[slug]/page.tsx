import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { PublicShell } from "@/components/public/public-shell";
import { getPolicyBySlug } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);
  if (!policy) return {};

  return {
    title: policy.seo_title || policy.title,
    description: policy.seo_description || policy.summary || undefined,
    alternates: { canonical: `/policies/${policy.slug}` },
    openGraph: {
      title: policy.seo_title || policy.title,
      description: policy.seo_description || policy.summary || undefined,
      url: absoluteUrl(`/policies/${policy.slug}`),
      type: "article",
    },
  };
}

export default async function PolicyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);
  if (!policy) notFound();

  return (
    <PublicShell>
      <article className="mx-auto max-w-4xl px-5 py-12">
        <Breadcrumb items={[{ label: "政策库", href: "/policies" }, { label: policy.title }]} />
        <p className="text-sm font-medium text-teal-700">
          {[policy.region_name, policy.policy_level, policy.publish_date].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {policy.title}
        </h1>
        <div className="mt-6 grid gap-2 border-y border-slate-200 py-4 text-sm text-slate-600 md:grid-cols-2">
          {policy.issuing_authority ? <p>发布机关：{policy.issuing_authority}</p> : null}
          {policy.source_url ? (
            <p>
              来源：
              <a className="text-teal-700" href={policy.source_url} target="_blank">
                原文链接
              </a>
            </p>
          ) : null}
        </div>
        {policy.summary ? (
          <p className="mt-8 rounded-lg bg-teal-50 p-5 leading-8 text-slate-700">{policy.summary}</p>
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-800">
          {policy.content}
        </div>
      </article>
    </PublicShell>
  );
}
