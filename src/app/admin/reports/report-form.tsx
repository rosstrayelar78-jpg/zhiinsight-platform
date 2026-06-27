import type { ReportSummary } from "@/lib/content";

export function ReportForm({
  action,
  report,
}: {
  action: (formData: FormData) => void | Promise<void>;
  report?: ReportSummary;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="标题" name="title" defaultValue={report?.title} required />
        <Field label="Slug" name="slug" defaultValue={report?.slug} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="发布机构" name="publisher" defaultValue={report?.publisher} />
        <Field label="发布日期" name="publish_date" type="date" defaultValue={report?.publish_date} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">状态</span>
          <select name="status" defaultValue={report?.status ?? "draft"} className="rounded-md border border-slate-300 px-3 py-2">
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_downloadable" defaultChecked={report?.is_downloadable ?? true} />
        <span>允许前台下载</span>
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-medium">PDF 文件{report?.file_original_name ? `（当前：${report.file_original_name}）` : ""}</span>
        <input name="pdf" type="file" accept="application/pdf" className="rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <Textarea label="摘要" name="summary" defaultValue={report?.summary} rows={4} />
      <Textarea label="正文" name="content" defaultValue={report?.content} rows={12} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Title" name="seo_title" defaultValue={report?.seo_title} />
        <Field label="SEO Description" name="seo_description" defaultValue={report?.seo_description} />
      </div>
      <button className="w-fit rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">保存</button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue ?? ""} className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-700" />
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
