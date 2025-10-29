"use client";
import { useEffect } from 'react';

function applyTheme(t: 'light'|'dark') {
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      let saved = (localStorage.getItem('theme') as 'light'|'dark'|null);
      if (!saved) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        saved = prefersDark ? 'dark' : 'light';
        localStorage.setItem('theme', saved);
      }
      applyTheme(saved);

      const onStorage = (e: StorageEvent) => {
        if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
          applyTheme(e.newValue);
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, []);
  return <>{children}</>;
}
