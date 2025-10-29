"use client";
import RoleGate from '@/components/RoleGate';
import Link from 'next/link';
import { BarChart3, Users, FileText } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <RoleGate role="admin">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><Users size={16}/> Users</div>
          <div className="mt-2 text-2xl font-semibold">Manage Users</div>
          <p className="text-sm text-gray-500 mt-1">Create creators, assign roles, reset passwords.</p>
          <Link href="#" className="inline-block mt-4 text-emerald-700 hover:underline">Open</Link>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><FileText size={16}/> Tests</div>
          <div className="mt-2 text-2xl font-semibold">All Tests</div>
          <p className="text-sm text-gray-500 mt-1">Audit content changes and access settings.</p>
          <Link href="/tests/create" className="inline-block mt-4 text-emerald-700 hover:underline">Create Test</Link>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><BarChart3 size={16}/> Analytics</div>
          <div className="mt-2 text-2xl font-semibold">Class Dashboards</div>
          <p className="text-sm text-gray-500 mt-1">Review improvements and weak topics.</p>
          <Link href="/reports/tests/1" className="inline-block mt-4 text-emerald-700 hover:underline">Open Dashboard</Link>
        </div>
      </div>
    </RoleGate>
  );
}
