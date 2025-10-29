"use client";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Shield, GraduationCap, User2, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 bg-emerald-300/30 blur-3xl rounded-full" />
        <div className="absolute bottom-0 -left-16 h-72 w-72 bg-emerald-200/30 blur-3xl rounded-full" />
      </div>

      <section className="mx-auto max-w-6xl py-8 sm:py-12">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-600 bg-white shadow-sm">
              <Sparkles size={16} className="text-emerald-600" />
              <span>Proximity TestLab</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">{t('app.title')}</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">Pre/Post testing and analytics with multilingual support. Create tests, generate with AI, and track improvement.</p>
            <div className="mt-5 flex gap-3">
              <Link href="/tests/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-[.98]">
                {t('app.create_test')} <ArrowRight size={16} />
              </Link>
              <Link href="/reports/tests/1" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-[.98]">
                View Dashboard
              </Link>
            </div>
          </div>
          <img src="/logo.svg" alt="Logo" className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Avg Improvement</div>
            <div className="text-2xl font-semibold">+18%</div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </div>
          <div className="rounded-xl border bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Tests Created</div>
            <div className="text-2xl font-semibold">124</div>
            <div className="text-xs text-gray-500">Across all teachers</div>
          </div>
          <div className="rounded-xl border bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Questions Generated (AI)</div>
            <div className="text-2xl font-semibold">3,420</div>
            <div className="text-xs text-gray-500">Reviewed & published</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-10">
        <div className="mb-3 text-sm text-gray-600">Choose your login</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 p-5 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-gray-600 text-sm"><Shield size={16} /> Admin</div>
            <div className="mt-2 text-xl font-semibold">Administration</div>
            <p className="text-sm text-gray-500 mt-1">Manage users, tests, and review analytics.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/login/admin" className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition active:scale-[.98]">Login</Link>
              <Link href="/register" className="px-3 py-1.5 rounded border hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 transition active:scale-[.98]">Register</Link>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-gray-600 text-sm"><GraduationCap size={16} /> Teacher</div>
            <div className="mt-2 text-xl font-semibold">Create & Analyze</div>
            <p className="text-sm text-gray-500 mt-1">Create tests, generate questions with AI, track class progress.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/login/teacher" className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-[.98]">Login</Link>
              <Link href="/tests/create" className="px-3 py-1.5 rounded border hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 transition active:scale-[.98]">Create Test</Link>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-gray-600 text-sm"><User2 size={16} /> Student</div>
            <div className="mt-2 text-xl font-semibold">Take & Improve</div>
            <p className="text-sm text-gray-500 mt-1">Join with access key, take tests, and view detailed reports.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/login/student" className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-900 transition active:scale-[.98]">Login</Link>
              <Link href="/student" className="px-3 py-1.5 rounded border hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 transition active:scale-[.98]">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
