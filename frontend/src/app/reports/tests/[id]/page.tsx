"use client";
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ClassMetrics {
  test_id: number;
  avg_pre: number;
  avg_post: number;
  improvement: number;
  topic_mastery: Record<string, number>;
  weak_topics: string[];
}

export default function ClassDashboardPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ClassMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/api/reports/tests/${id}/class`);
        setData(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load class report');
      } finally { setLoading(false); }
    };
    if (id) run();
  }, [id]);

  const scoreBars = useMemo(() => (
    [{ name: 'Pre', value: data?.avg_pre ?? 0 }, { name: 'Post', value: data?.avg_post ?? 0 }]
  ), [data]);

  const topicRows = useMemo(() => Object.entries(data?.topic_mastery || {}).map(([k,v]) => ({ topic: k || '—', pct: v })), [data]);

  if (loading) return <div className="max-w-6xl mx-auto">Loading...</div>;
  if (error) return <div className="max-w-6xl mx-auto text-red-600">{error}</div>;
  if (!data) return <div className="max-w-6xl mx-auto">No data</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Average (Pre)</div>
          <div className="text-2xl font-semibold">{data.avg_pre}</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Average (Post)</div>
          <div className="text-2xl font-semibold">{data.avg_post}</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Improvement</div>
          <div className="text-2xl font-semibold">{data.improvement}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="font-semibold mb-3">Pre vs Post</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="font-semibold mb-3">Topic Mastery (Post)</div>
        <div className="grid md:grid-cols-2 gap-3">
          {topicRows.map((r) => (
            <div key={r.topic} className="flex items-center justify-between border rounded p-3">
              <span>{r.topic}</span>
              <span className="text-sm text-gray-700">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {data.weak_topics?.length ? (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="font-semibold mb-2">Weak Topics</div>
          <div className="flex flex-wrap gap-2">
            {data.weak_topics.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">{t}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
