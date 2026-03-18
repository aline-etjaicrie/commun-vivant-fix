'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Banknote, Building2, FileText, Home, Palette, Settings, Sparkles, Users } from 'lucide-react';

interface ProShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const navItems = [
  { href: '/pro/accueil', label: 'Accueil', icon: Home },
  { href: '/pro/solenn', label: 'Solenn', icon: Sparkles },
  { href: '/pro/memoriaux', label: 'Memoriaux', icon: FileText },
  { href: '/pro/commissions', label: 'Commissions', icon: Banknote },
  { href: '/pro/branding', label: 'Branding', icon: Palette },
  { href: '/pro/equipe', label: 'Equipe', icon: Users },
  { href: '/pro/parametres', label: 'Parametres', icon: Settings },
];

export default function ProShell({ title, subtitle, children }: ProShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#13212E]">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[#D8DEE5] bg-white p-5 lg:block">
          <div className="mb-8 rounded-xl border border-[#D8DEE5] bg-[#F8FAFC] p-4">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#5A6B7B]">
              <Building2 className="h-4 w-4" />
              Commun Vivant Pro
            </div>
            <p className="text-sm font-semibold">Dashboard Pompes Funebres</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-[#13212E] text-white' : 'text-[#243648] hover:bg-[#EDF2F7]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <header className="mb-6 rounded-2xl border border-[#D8DEE5] bg-white px-6 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6B7A89]">Module Pro Independant</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#5A6B7B]">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
