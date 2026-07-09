import Link from "next/link";

import { signup } from "@/lib/auth-actions";
import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/nav/BrandMark";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const { error, checkEmail } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <BrandMark />
        </div>

        <h1 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          Create an account
        </h1>

        {error && (
          <p className="mb-4 rounded-2xl bg-redcard-50 px-3 py-2 text-sm font-semibold text-redcard-700 dark:bg-redcard-500/10 dark:text-redcard-100">
            {error}
          </p>
        )}

        {checkEmail && (
          <p className="mb-4 rounded-2xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-800 dark:bg-green-500/10 dark:text-green-300">
            Check your email for a confirmation link to finish signing up.
          </p>
        )}

        <form action={signup} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full name
            <input
              type="text"
              name="fullName"
              required
              className="rounded-2xl border border-slate-200/70 px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-green-600 focus:shadow-soft focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-2xl border border-slate-200/70 px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-green-600 focus:shadow-soft focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-2xl border border-slate-200/70 px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-green-600 focus:shadow-soft focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-pitch-900/70 dark:text-white"
            />
          </label>
          <button
            type="submit"
            className="mt-2 flex min-h-11 items-center justify-center rounded-2xl bg-green-700 px-3 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-cta transition-all hover:bg-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-pitch-900"
          >
            Sign up
          </button>
        </form>

        <p className="mt-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-green-700 dark:text-green-400">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
