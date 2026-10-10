import type { Metadata } from 'next';
import { Geist_Mono, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/wealth/shell';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vista — Your household wealth',
  description:
    'Everything your household owns, everywhere. An interactive wealth tracking prototype.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hankenGrotesk.variable} ${geistMono.variable} antialiased`}
      >
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
