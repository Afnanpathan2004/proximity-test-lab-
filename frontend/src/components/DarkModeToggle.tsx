"use client";
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light'|'dark') || 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button onClick={toggle} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
      {theme === 'dark' ? (<><Sun size={16}/> Light</>) : (<><Moon size={16}/> Dark</>)}
    </button>
  );
}
