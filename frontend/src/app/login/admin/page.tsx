"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, setRefreshToken } from '@/lib/auth';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      router.push('/admin');
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const onDemo = async () => {
    setErr(null); setLoading(true);
    const demoEmail = 'demo-admin@example.local';
    const demoPass = 'demo12345';
    try {
      try {
        await api.post('/api/auth/register', { name: 'Demo Admin', email: demoEmail, password: demoPass, role: 'admin' });
      } catch {}
      const { data } = await api.post('/api/auth/login', { email: demoEmail, password: demoPass });
      setToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      router.push('/admin');
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Demo login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl border bg-white dark:bg-gray-950 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-emerald-600" />
          <h1 className="text-xl font-semibold">Admin Login</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-gray-900" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-gray-900" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition active:scale-[.98]" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-3">
          <button onClick={onDemo} className="w-full px-4 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[.98]" disabled={loading}>Use Demo Admin</button>
        </div>
      </div>
    </div>
  );
}
