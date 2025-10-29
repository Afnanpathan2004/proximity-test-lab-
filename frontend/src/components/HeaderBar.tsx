"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, Me } from '@/lib/user';
import { clearToken } from '@/lib/auth';
import { Languages, LogOut, PlusCircle, BarChart3, Home } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';

export default function HeaderBar() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const u = await fetchMe();
        setMe(u);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pathname]);

  const logout = () => {
    clearToken();
    router.push('/');
  };

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Proximity TestLab" className="h-6 w-6" />
          <Link href="/" className="font-semibold hover:text-emerald-700">Proximity TestLab</Link>
        </div>
        <div className="flex items-center gap-3">
          {me && (me.role === 'teacher' || me.role === 'admin') ? (
            <Link href="/tests/create" className="hidden sm:inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"><PlusCircle size={16}/> Create</Link>
          ) : null}
          {me && (me.role === 'teacher' || me.role === 'admin') ? (
            <Link href="/reports/tests/1" className="hidden sm:inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"><BarChart3 size={16}/> Reports</Link>
          ) : null}
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-gray-500"/>
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>
          {me ? (
            <div className="flex items-center gap-2">
              {me.role === 'admin' && <Link href="/admin" className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50">Admin</Link>}
              {me.role === 'teacher' && <Link href="/teacher" className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50">Teacher</Link>}
              {me.role === 'student' && <Link href="/student" className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50">Student</Link>}
              <button onClick={logout} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                <LogOut size={16}/> Logout
              </button>
            </div>
          ) : (
            <details className="relative">
              <summary className="list-none cursor-pointer text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Login</summary>
              <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700 shadow">
                <Link href="/login/admin" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Admin</Link>
                <Link href="/login/teacher" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Teacher</Link>
                <Link href="/login/student" className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Student</Link>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
