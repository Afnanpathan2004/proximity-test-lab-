"use client";
import React from 'react';
import '../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>; 
}
