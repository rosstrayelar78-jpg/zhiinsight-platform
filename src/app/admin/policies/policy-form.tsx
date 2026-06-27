import type { Policy, Region } from "@/lib/content";

const levels = [
  { value: "national", label: "国家级" },
  { value: "provincial", label: "省级" },
  { value: "municipal", label: "市级" },
  { value: "district", label: "区县级" },
];

export function PolicyForm({
  action,
  policy,
  regions,
}: {
  action: (formData: FormData) => void | Promise<void>;
  policy?: Policy;
  regions: Region[];
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="标题" name="title" defaultValue={policy?.title} required />
        <Field label="Slug" name="slug" defaultValue={policy?.slug} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="发布机关" name="issuing_authority" defaultValue={policy?.issuing_authority} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">地区</span>
          <select
            name="region_id"
            defaultValue={policy?.region_id ?? ""}
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
        <label className="grid gap-2 text-sm">
          <span className="font-medium">政策层级</span>
          <select
            name="policy_level"
            defaultValue={policy?.policy_level ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">未设置</option>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="发布日期" name="publish_date" type="date" defaultValue={policy?.publish_date} />
        <Field label="来源链接" name="source_url" defaultValue={policy?.source_url} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">状态</span>
          <select
            name="status"
            defaultValue={policy?.status ?? "draft"}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>
      </div>
      <Textarea label="摘要" name="summary" defaultValue={policy?.summary} rows={4} />
      <Textarea label="正文" name="content" defaultValue={policy?.content} rows={14} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Title" name="seo_title" defaultValue={policy?.seo_title} />
        <Field label="SEO Description" name="seo_description" defaultValue={policy?.seo_description} />
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
