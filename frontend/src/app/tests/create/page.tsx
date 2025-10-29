"use client";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import RoleGate from '@/components/RoleGate';
import { PlusCircle } from 'lucide-react';

export default function CreateTestPage() {
  const { t } = useTranslation();
  const { push } = useToast();
  const [title, setTitle] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [language, setLanguage] = useState('en');
  const [accessKey, setAccessKey] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      const { data } = await api.post('/api/tests', {
        title,
        syllabus,
        language,
        access_key: accessKey,
        settings: { time_limit: 900 }
      });
      setMsg(`Created test #${data.id}`);
      push('success', `Created test #${data.id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Failed');
      push('error', e?.response?.data?.detail || 'Failed to create test');
    }
  };

  return (
    <RoleGate role={["teacher", "admin"]}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm"><PlusCircle size={16}/> {t('app.create_test')}</div>
        <h1 className="text-2xl font-semibold mb-4">Design your assessment</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder={t('test.title') as string} value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder={t('test.syllabus') as string} value={syllabus} onChange={e=>setSyllabus(e.target.value)} />
          <select className="border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" value={language} onChange={e=>setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
          <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder={t('test.access_key') as string} value={accessKey} onChange={e=>setAccessKey(e.target.value)} />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          {msg && <div className="text-emerald-700 text-sm">{msg}</div>}
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition" type="submit">{t('test.create')}</button>
        </form>
      </div>
    </RoleGate>
  );
}
