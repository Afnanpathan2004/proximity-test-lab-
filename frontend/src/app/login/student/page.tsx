"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, setRefreshToken } from '@/lib/auth';
import { User2 } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      router.push('/student');
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const onGuest = async () => {
    setErr(null); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/guest_login', { name: guestName || 'Guest' });
      setToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      router.push('/student');
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Guest login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl border bg-white dark:bg-gray-950 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User2 className="text-emerald-600" />
          <h1 className="text-xl font-semibold">Student Login</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-gray-900" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-gray-900" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition active:scale-[.98]" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <div className="text-xs text-gray-500">or</div>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <div className="space-y-2">
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-gray-900" placeholder="Your name (optional)" value={guestName} onChange={e=>setGuestName(e.target.value)} />
          <button onClick={onGuest} className="w-full px-4 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[.98]" disabled={loading}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}
