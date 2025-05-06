import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/app-providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
});

export const metadata: Metadata = {
  title: 'Hadith Finder',
  description: 'Search and explore Hadiths easily.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
  },
  themeColor: '#3498db',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} ${notoSansArabic.variable} antialiased font-sans`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
