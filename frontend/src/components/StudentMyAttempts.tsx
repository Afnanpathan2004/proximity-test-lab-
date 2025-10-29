"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface A { id: number; test_id: number; type: string; start_ts?: string; end_ts?: string; score?: number }

export default function StudentMyAttempts() {
  const [items, setItems] = useState<A[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get('/api/attempts');
        setItems(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load attempts');
      } finally { setLoading(false); }
    };
    run();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  if (!items.length) return <div className="text-sm text-gray-500">No attempts yet.</div>;

  return (
    <div className="grid gap-3">
      {items.map(a => (
        <div key={a.id} className="rounded-lg border bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="font-medium">Attempt #{a.id} • Test #{a.test_id} • {a.type.toUpperCase()}</div>
            <div className="text-xs text-gray-500">Score: {a.score ?? '—'}</div>
          </div>
          <div className="flex gap-2">
            {a.end_ts ? (
              <Link href={`/reports/attempt/${a.id}`} className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50">Report</Link>
            ) : (
              <Link href={`/tests/${a.test_id}/take?attempt=${a.id}`} className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Resume</Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
