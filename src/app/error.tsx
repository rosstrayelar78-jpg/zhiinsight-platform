"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-5">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">页面暂时不可用</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          服务遇到临时问题，请稍后重试。生产环境不会向前台暴露错误堆栈。
        </p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
