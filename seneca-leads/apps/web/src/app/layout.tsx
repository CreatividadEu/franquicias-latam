import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seneca Leads',
  description: 'B2B lead intelligence for Colombian SMBs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className="dark">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
