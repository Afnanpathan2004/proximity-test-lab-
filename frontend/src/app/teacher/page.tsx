"use client";
import RoleGate from '@/components/RoleGate';
import Link from 'next/link';
import { PlusCircle, BarChart3, FileText } from 'lucide-react';
import TeacherMyTests from '@/components/TeacherMyTests';

export default function TeacherDashboard() {
  return (
    <RoleGate role="teacher">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 text-sm"><PlusCircle size={16}/> Create</div>
            <div className="mt-2 text-2xl font-semibold">New Test</div>
            <p className="text-sm text-gray-500 mt-1">Create manually or generate with AI, then review and publish.</p>
            <Link href="/tests/create" className="inline-block mt-4 text-emerald-700 hover:underline">Create Test</Link>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 text-sm"><BarChart3 size={16}/> Analytics</div>
            <div className="mt-2 text-2xl font-semibold">Class Dashboard</div>
            <p className="text-sm text-gray-500 mt-1">Track pre/post improvement and topic mastery.</p>
            <Link href="/reports/tests/1" className="inline-block mt-4 text-emerald-700 hover:underline">Open</Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm text-gray-600">My Tests</div>
          <TeacherMyTests />
        </div>
      </div>
    </RoleGate>
  );
}
