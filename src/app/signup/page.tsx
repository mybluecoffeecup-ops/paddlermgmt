import Link from "next/link";
import { Anchor } from "lucide-react";

import { signup } from "@/lib/auth-actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const { error, checkEmail } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#071620]">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1f2e]">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
            <Anchor size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Paddler
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Crew Management
            </p>
          </div>
        </div>

        <h1 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          Create an account
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {checkEmail && (
          <p className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-500/10 dark:text-teal-300">
            Check your email for a confirmation link to finish signing up.
          </p>
        )}

        <form action={signup} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
            <input
              type="text"
              name="fullName"
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Sign up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
