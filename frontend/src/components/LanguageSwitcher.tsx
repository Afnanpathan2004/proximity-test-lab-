"use client";
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
    if (typeof window !== 'undefined') localStorage.setItem('i18nextLng', e.target.value);
  };
  return (
    <select onChange={change} value={i18n.resolvedLanguage} className="border rounded px-2 py-1">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="mr">मराठी</option>
    </select>
  );
}
