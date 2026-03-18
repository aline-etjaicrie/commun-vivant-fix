'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock3, Home, ImageIcon, MessageCircle, ScrollText, Settings } from 'lucide-react';

const navItems = [
  { href: '/espace/accueil', label: 'Accueil', icon: Home },
  { href: '/espace/memoriaux', label: 'Mes memoriaux', icon: ScrollText },
  { href: '/espace/medias', label: 'Medias', icon: ImageIcon },
  { href: '/espace/messages-bougies', label: 'Messages', icon: MessageCircle },
  { href: '/espace/options-duree', label: 'Options', icon: Clock3 },
  { href: '/espace/parametres', label: 'Parametres', icon: Settings },
];

export default function UserDashboardShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1B2D3E]">
      <div className="mx-auto flex w-full max-w-[1280px] gap-0">
        <aside className="hidden w-64 shrink-0 border-r border-[#E5E7EB] bg-white p-4 md:block">
          <p className="mb-6 mt-1 text-xs uppercase tracking-[0.18em] text-[#6B7280]">Commun Vivant</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-[#1B2D3E] text-white' : 'text-[#334155] hover:bg-[#EEF2F7]'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <header className="mb-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Dashboard usager</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E7EB] bg-white/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${active ? 'text-[#1B2D3E]' : 'text-[#6B7280]'}`}>
                <Icon className="h-4 w-4" />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
