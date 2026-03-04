import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bloom Together - Community Doodle Garden',
  description: 'Contribute your digital flower drawings to our collective virtual garden.',
};

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GlobalShutter from '@/components/GlobalShutter';
import AuthProvider from '@/components/AuthProvider';
import SoundProvider from '@/components/SoundProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${fredoka.variable} ${nunito.variable} font-body text-text-light antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <SoundProvider>
            <Navigation />
            <GlobalShutter />
            <main className="flex-1 flex flex-col relative">
              {children}
            </main>
            <Footer />
          </SoundProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
