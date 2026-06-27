import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-950">
          返回前台
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">管理员登录</h1>
        <p className="mt-2 text-sm text-slate-500">进入 SERI 内容管理后台。</p>
        {params.error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            用户名或密码不正确。
          </p>
        ) : null}
        <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">用户名</span>
            <input
              name="username"
              required
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-700"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">密码</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-700"
            />
          </label>
          <button className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">
            登录
          </button>
        </form>
      </div>
    </main>
  );
}
