import Link from "next/link";
import { Anchor } from "lucide-react";

import { login } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#071620]">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1f2e]">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-ember-500 text-white shadow-sm">
            <Anchor size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Paddler
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Crew Management
            </p>
          </div>
        </div>

        <h1 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">Log in</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0b1f2e]"
          >
            Log in
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-teal-600 dark:text-teal-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
