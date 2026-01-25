import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { PWARegistration } from '@/components/pwa-registration';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'OSEAN - Gestion de Boutique',
  description: 'Application de gestion de boutique avec caisse et facturation',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} font-sans antialiased text-white`}>
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
