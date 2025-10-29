"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

interface Q {
  id: number;
  stem: string;
  options: string[];
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const sp = useSearchParams();
  const attemptId = sp.get('attempt');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // fetch questions
  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/api/tests/${id}/questions`);
        setQuestions(data);
        const init: Record<number, number | null> = {};
        data.forEach((q: Q) => (init[q.id] = null));
        setAnswers(init);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  // autosave every 20s
  useEffect(() => {
    if (!attemptId) return;
    const t = setInterval(() => {
      Object.entries(answers).forEach(async ([qidStr, ans]) => {
        const qid = Number(qidStr);
        await api.post(`/api/attempts/${attemptId}/answer`, {
          question_id: qid,
          chosen_index: ans,
        }).catch(() => {});
      });
    }, 20000);
    return () => clearInterval(t);
  }, [answers, attemptId]);

  const onChoose = async (qid: number, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
    if (!attemptId) return;
    try {
      await api.post(`/api/attempts/${attemptId}/answer`, {
        question_id: qid,
        chosen_index: idx,
      });
    } catch {}
  };

  const onSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/attempts/${attemptId}/submit`);
      router.push(`/reports/attempt/${data.attempt_id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Take Test</h1>
      {questions.map((q, i) => (
        <div key={q.id} className="border rounded p-3 bg-white">
          <div className="font-medium mb-2">{i + 1}. {q.stem}</div>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === oi}
                  onChange={() => onChoose(q.id, oi)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button disabled={submitting} onClick={onSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded">
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}
