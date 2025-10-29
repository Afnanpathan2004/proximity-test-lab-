"use client";
import RoleGate from '@/components/RoleGate';
import Link from 'next/link';
import { PlayCircle, History, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import StudentMyAttempts from '@/components/StudentMyAttempts';

export default function StudentDashboard() {
  const router = useRouter();
  const [testId, setTestId] = useState('');
  const [type, setType] = useState<'pre'|'post'>('pre');
  const [accessKey, setAccessKey] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    try {
      const { data } = await api.post(`/api/tests/${testId}/start`, { type, access_key: accessKey });
      router.push(`/tests/${testId}/take?attempt=${data.attempt_id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Failed to join');
    }
  };

  return (
    <RoleGate role="student">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><PlayCircle size={16}/> Start Test</div>
          <div className="mt-2 text-2xl font-semibold">Join with Access Key</div>
          <p className="text-sm text-gray-500 mt-1">Enter the Test ID and Access Key shared by your teacher.</p>
          <form onSubmit={onJoin} className="space-y-2 mt-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Test ID" value={testId} onChange={e=>setTestId(e.target.value)} />
            <select className="w-full border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value as 'pre'|'post')}>
              <option value="pre">Pre</option>
              <option value="post">Post</option>
            </select>
            <input className="w-full border rounded px-3 py-2" placeholder="Access Key" value={accessKey} onChange={e=>setAccessKey(e.target.value)} />
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Join Test</button>
          </form>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm col-span-2">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><History size={16}/> My Attempts</div>
          <div className="mt-3">
            <StudentMyAttempts />
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm"><TrendingUp size={16}/> Progress</div>
          <div className="mt-2 text-2xl font-semibold">Improve Topics</div>
          <p className="text-sm text-gray-500 mt-1">Focus on weak topics suggested by the report.</p>
          <Link href="/" className="inline-block mt-4 text-emerald-700 hover:underline">See Tips</Link>
        </div>
      </div>
    </RoleGate>
  );
}
