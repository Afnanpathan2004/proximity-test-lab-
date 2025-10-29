"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function StartAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [type, setType] = useState<'pre' | 'post'>('pre');
  const [accessKey, setAccessKey] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await api.post(`/api/tests/${id}/start`, { type, access_key: accessKey });
      const attemptId = data.attempt_id;
      router.push(`/tests/${id}/take?attempt=${attemptId}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Failed to start attempt');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Start Attempt</h1>
      <form onSubmit={onStart} className="space-y-3">
        <div className="flex gap-3 items-center">
          <label className="text-sm">Type</label>
          <select className="border rounded px-2 py-1" value={type} onChange={e=>setType(e.target.value as 'pre'|'post')}>
            <option value="pre">Pre</option>
            <option value="post">Post</option>
          </select>
        </div>
        <input className="w-full border rounded px-3 py-2" placeholder="Access Key" value={accessKey} onChange={e=>setAccessKey(e.target.value)} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Start</button>
      </form>
    </div>
  );
}
