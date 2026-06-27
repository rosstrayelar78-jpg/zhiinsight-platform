import Link from "next/link";
import { createPolicy } from "@/app/admin/policies/actions";
import { PolicyForm } from "@/app/admin/policies/policy-form";
import { getRegions, type Region } from "@/lib/content";

export default async function NewPolicyPage() {
  let regions: Region[] = [];
  try {
    regions = await getRegions();
  } catch {
    regions = [];
  }

  return (
    <section>
      <Link href="/admin/policies" className="text-sm text-slate-500 hover:text-slate-950">
        返回政策管理
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">新增政策</h1>
      <div className="mt-6">
        <PolicyForm action={createPolicy} regions={regions} />
      </div>
    </section>
  );
}
