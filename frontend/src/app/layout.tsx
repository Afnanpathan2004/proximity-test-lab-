import '../styles/globals.css';
import React from 'react';
import I18nProvider from '@/components/I18nProvider';
import HeaderBar from '@/components/HeaderBar';
import ToastProvider from '@/components/ui/Toast';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'Proximity TestLab',
  description: 'Pre/Post testing and analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <HeaderBar />
              <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
