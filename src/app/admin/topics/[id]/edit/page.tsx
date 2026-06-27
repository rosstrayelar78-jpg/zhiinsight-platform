import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTopic } from "@/app/admin/topics/actions";
import { TopicForm } from "@/app/admin/topics/topic-form";
import { getTopicById, getTopicRelationIds, listPublishedContentForRelations } from "@/lib/content";

export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [topic, options, relations] = await Promise.all([
    getTopicById(id),
    listPublishedContentForRelations(),
    getTopicRelationIds(id),
  ]);
  if (!topic) notFound();
  const selected = {
    policy: relations.filter((item) => item.content_type === "policy").map((item) => item.content_id),
    case: relations.filter((item) => item.content_type === "case").map((item) => item.content_id),
    report: relations.filter((item) => item.content_type === "report").map((item) => item.content_id),
  };

  return (
    <section>
      <Link href="/admin/topics" className="text-sm text-slate-500 hover:text-slate-950">返回专题管理</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">编辑专题</h1>
      <div className="mt-6">
        <TopicForm action={updateTopic.bind(null, topic.id)} topic={topic} options={options} selected={selected} />
      </div>
    </section>
  );
}
