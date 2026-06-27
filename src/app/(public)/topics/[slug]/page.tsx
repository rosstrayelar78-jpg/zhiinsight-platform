import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { ContentCard } from "@/components/public/content-card";
import { PublicShell } from "@/components/public/public-shell";
import { getTopicBySlug, getTopicRelations } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return {};
  return {
    title: topic.seo_title || topic.title,
    description: topic.seo_description || topic.summary || undefined,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: {
      title: topic.seo_title || topic.title,
      description: topic.seo_description || topic.summary || undefined,
      url: absoluteUrl(`/topics/${topic.slug}`),
      type: "article",
    },
  };
}

export default async function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();
  const relations = await getTopicRelations(topic.id);

  return (
    <PublicShell>
      <article className="mx-auto max-w-5xl px-5 py-12">
        <Breadcrumb items={[{ label: "产业专题", href: "/topics" }, { label: topic.title }]} />
        <p className="text-sm font-medium text-teal-700">Industry Topic</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {topic.title}
        </h1>
        {topic.summary ? (
          <p className="mt-8 rounded-lg bg-teal-50 p-5 leading-8 text-slate-700">{topic.summary}</p>
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-800">
          {topic.content}
        </div>

        <RelatedSection title="关联政策">
          {relations.policies.map((item) => (
            <ContentCard
              key={item.id}
              href={`/policies/${item.slug}`}
              title={item.title}
              summary={item.summary}
            />
          ))}
        </RelatedSection>
        <RelatedSection title="关联案例">
          {relations.cases.map((item) => (
            <ContentCard
              key={item.id}
              href={`/cases/${item.slug}`}
              title={item.title}
              summary={item.summary}
            />
          ))}
        </RelatedSection>
        <RelatedSection title="关联报告">
          {relations.reports.map((item) => (
            <ContentCard
              key={item.id}
              href={`/reports/${item.slug}`}
              title={item.title}
              summary={item.summary}
            />
          ))}
        </RelatedSection>
      </article>
    </PublicShell>
  );
}

function RelatedSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
