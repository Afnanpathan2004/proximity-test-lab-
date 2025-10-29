"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface T { id: number; title: string; language?: string; created_at?: string }

export default function TeacherMyTests() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get('/api/tests?mine=1');
        setItems(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load tests');
      } finally { setLoading(false); }
    };
    run();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  if (!items.length) return <div className="text-sm text-gray-500">No tests yet.</div>;

  return (
    <div className="grid gap-3">
      {items.map(t => (
        <div key={t.id} className="rounded-lg border bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-gray-500">#{t.id} • {t.language || '—'}</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/tests/${t.id}/start`} className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50">Start</Link>
            <Link href={`/reports/tests/${t.id}`} className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Dashboard</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
