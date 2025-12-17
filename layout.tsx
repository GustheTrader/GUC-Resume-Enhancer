
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ground UP Careers - Resume Enhancer',
  description: 'AI-powered resume enhancement tool to boost your career prospects with ATS optimization, professional formatting, and industry-specific improvements.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
