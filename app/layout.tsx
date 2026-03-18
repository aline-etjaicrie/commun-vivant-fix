import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Commun Vivant',
  description: 'Créer un espace de mémoire. Raconter une histoire. Partager vos souvenirs.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="font-sans">
      <body className="font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}
