import { PublicShell } from "@/components/public/public-shell";

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-medium text-teal-700">About SERI</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">关于我们</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          知璟银发智库致力于建设中国银发经济产业研究平台，持续沉淀政策、案例、专题与报告，为政府、企业、投资与研究机构提供基础研究支撑。
        </p>
      </section>
    </PublicShell>
  );
}
