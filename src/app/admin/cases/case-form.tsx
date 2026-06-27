import type { CaseStudy, Region, Tag } from "@/lib/content";

export function CaseForm({
  action,
  caseStudy,
  regions,
  tags,
  selectedTagIds = [],
}: {
  action: (formData: FormData) => void | Promise<void>;
  caseStudy?: CaseStudy;
  regions: Region[];
  tags: Tag[];
  selectedTagIds?: string[];
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="标题" name="title" defaultValue={caseStudy?.title} required />
        <Field label="Slug" name="slug" defaultValue={caseStudy?.slug} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">地区</span>
          <select
            name="region_id"
            defaultValue={caseStudy?.region_id ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">未设置</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="案例类型" name="case_type" defaultValue={caseStudy?.case_type} />
        <Field label="所属行业" name="industry" defaultValue={caseStudy?.industry} />
      </div>
      <label className="grid gap-2 text-sm">
        <span className="font-medium">状态</span>
        <select
          name="status"
          defaultValue={caseStudy?.status ?? "draft"}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
      </label>
      <div className="grid gap-2 text-sm">
        <span className="font-medium">标签</span>
        <div className="flex flex-wrap gap-3 rounded-md border border-slate-200 p-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="tag_ids"
                value={tag.id}
                defaultChecked={selectedTagIds.includes(tag.id)}
              />
              <span>{tag.name}</span>
            </label>
          ))}
          {!tags.length ? <span className="text-slate-500">暂无案例标签。</span> : null}
        </div>
      </div>
      <Textarea label="摘要" name="summary" defaultValue={caseStudy?.summary} rows={4} />
      <Textarea label="正文" name="content" defaultValue={caseStudy?.content} rows={14} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Title" name="seo_title" defaultValue={caseStudy?.seo_title} />
        <Field label="SEO Description" name="seo_description" defaultValue={caseStudy?.seo_description} />
      </div>
      <button className="w-fit rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">
        保存
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-700"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows: number;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-slate-300 px-3 py-2 leading-7 outline-none focus:border-teal-700"
      />
    </label>
  );
}
