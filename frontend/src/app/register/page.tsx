"use client";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'creator'>('student');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/auth/register', { name, email, password, role });
      router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t('app.register')}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder={t('auth.name') as string} value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder={t('auth.email') as string} value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder={t('auth.password') as string} value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-3 items-center">
          <label className="text-sm">Role</label>
          <select className="border rounded px-2 py-1" value={role} onChange={(e)=>setRole(e.target.value as any)}>
            <option value="student">Student</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="px-4 py-2 bg-emerald-600 text-white rounded" type="submit">{t('auth.submit')}</button>
      </form>
    </div>
  );
}
