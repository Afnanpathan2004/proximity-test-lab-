"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Breakdown {
  exists: boolean;
  attempt: { id: number; test_id: number; type: string; score: number };
  total: number;
  correct: number;
  topic_mastery: Record<string, number>;
}

export default function AttemptReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Breakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/api/reports/attempts/${id}`);
        setData(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto text-red-600">{error}</div>;
  if (!data?.exists) return <div className="max-w-3xl mx-auto">Attempt not found</div>;

  const pct = data.total ? Math.round((data.correct / data.total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Attempt Report</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-white">
          <div className="text-sm text-gray-500">Attempt</div>
          <div className="font-medium">#{data.attempt.id} ({data.attempt.type})</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-sm text-gray-500">Score</div>
          <div className="font-medium">{data.attempt.score ?? pct}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-sm text-gray-500">Correct</div>
          <div className="font-medium">{data.correct} / {data.total} ({pct}%)</div>
        </div>
      </div>

      <div className="border rounded p-3 bg-white">
        <div className="font-semibold mb-2">Topic Mastery</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.topic_mastery || {}).map(([k,v]) => (
            <div key={k} className="flex items-center justify-between">
              <span>{k || '—'}</span>
              <span className="text-sm text-gray-700">{v}%</span>
            </div>
          ))}
        </div>
      </div>

      <a className="inline-block px-4 py-2 bg-emerald-600 text-white rounded" href="#" onClick={(e)=>{e.preventDefault(); window.print();}}>Download PDF (temp)</a>
    </div>
  );
}
