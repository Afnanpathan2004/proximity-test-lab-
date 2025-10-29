"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastKind = 'success' | 'error' | 'info';
export interface ToastItem { id: number; kind: ToastKind; message: string }

const ToastCtx = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t) => (
          <div key={t.id} className={`min-w-[260px] rounded-lg border shadow bg-white px-4 py-3 ${
            t.kind === 'success' ? 'border-emerald-200' : t.kind === 'error' ? 'border-red-200' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${t.kind === 'success' ? 'text-emerald-700' : t.kind === 'error' ? 'text-red-700' : 'text-gray-700'}`}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
