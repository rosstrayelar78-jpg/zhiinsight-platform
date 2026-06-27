import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePolicy } from "@/app/admin/policies/actions";
import { PolicyForm } from "@/app/admin/policies/policy-form";
import { getPolicyById, getRegions } from "@/lib/content";

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [policy, regions] = await Promise.all([getPolicyById(id), getRegions()]);
  if (!policy) notFound();

  return (
    <section>
      <Link href="/admin/policies" className="text-sm text-slate-500 hover:text-slate-950">
        返回政策管理
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">编辑政策</h1>
      <div className="mt-6">
        <PolicyForm action={updatePolicy.bind(null, policy.id)} policy={policy} regions={regions} />
      </div>
    </section>
  );
}
