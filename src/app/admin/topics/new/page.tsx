import Link from "next/link";
import { createTopic } from "@/app/admin/topics/actions";
import { TopicForm } from "@/app/admin/topics/topic-form";
import {
  listPublishedContentForRelations,
  type CaseStudy,
  type Policy,
  type ReportSummary,
} from "@/lib/content";

export default async function NewTopicPage() {
  let options: { policies: Policy[]; cases: CaseStudy[]; reports: ReportSummary[] } = {
    policies: [],
    cases: [],
    reports: [],
  };
  try {
    options = await listPublishedContentForRelations();
  } catch {
    options = { policies: [], cases: [], reports: [] };
  }

  return (
    <section>
      <Link href="/admin/topics" className="text-sm text-slate-500 hover:text-slate-950">返回专题管理</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">新增专题</h1>
      <div className="mt-6">
        <TopicForm action={createTopic} options={options} selected={{ policy: [], case: [], report: [] }} />
      </div>
    </section>
  );
}
