import type { CaseStudy, Policy, ReportSummary, TopicSummary } from "@/lib/content";

export function TopicForm({
  action,
  topic,
  options,
  selected,
}: {
  action: (formData: FormData) => void | Promise<void>;
  topic?: TopicSummary;
  options: { policies: Policy[]; cases: CaseStudy[]; reports: ReportSummary[] };
  selected: { policy: string[]; case: string[]; report: string[] };
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="标题" name="title" defaultValue={topic?.title} required />
        <Field label="Slug" name="slug" defaultValue={topic?.slug} />
      </div>
      <Field label="封面图 URL" name="cover_image" defaultValue={topic?.cover_image} />
      <label className="grid gap-2 text-sm">
        <span className="font-medium">状态</span>
        <select name="status" defaultValue={topic?.status ?? "draft"} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
      </label>
      <Textarea label="摘要" name="summary" defaultValue={topic?.summary} rows={4} />
      <Textarea label="正文" name="content" defaultValue={topic?.content} rows={14} />
      <RelationGroup title="关联政策" name="policy_ids" items={options.policies} selected={selected.policy} />
      <RelationGroup title="关联案例" name="case_ids" items={options.cases} selected={selected.case} />
      <RelationGroup title="关联报告" name="report_ids" items={options.reports} selected={selected.report} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Title" name="seo_title" defaultValue={topic?.seo_title} />
        <Field label="SEO Description" name="seo_description" defaultValue={topic?.seo_description} />
      </div>
      <button className="w-fit rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">保存</button>
    </form>
  );
}

function RelationGroup({
  title,
  name,
  items,
  selected,
}: {
  title: string;
  name: string;
  items: Array<{ id: string; title: string }>;
  selected: string[];
}) {
  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{title}</span>
      <div className="max-h-48 overflow-auto rounded-md border border-slate-200 p-3">
        {items.map((item) => (
          <label key={item.id} className="mb-2 flex gap-2">
            <input type="checkbox" name={name} value={item.id} defaultChecked={selected.includes(item.id)} />
            <span>{item.title}</span>
          </label>
        ))}
        {!items.length ? <span className="text-slate-500">暂无可关联内容。</span> : null}
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} required={required} defaultValue={defaultValue ?? ""} className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-700" />
    </label>
  );
}

function Textarea({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string | null; rows: number }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} className="rounded-md border border-slate-300 px-3 py-2 leading-7 outline-none focus:border-teal-700" />
    </label>
  );
}
