import Link from 'next/link';
import {
  Eye,
  MessageSquare,
  Mic2,
  Palette,
  PlayCircle,
  Users,
} from 'lucide-react';
import type { DashboardAction } from '@/lib/user-dashboard/presentation';

const ICONS = {
  preview: Eye,
  contributors: Users,
  messages: MessageSquare,
  style: Palette,
  media: Mic2,
  video: PlayCircle,
  generate: Palette,
  text: MessageSquare,
  validate: Palette,
} as const;

export default function UserContextActions({ actions }: { actions: DashboardAction[] }) {
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Actions utiles</p>
        <h3 className="mt-2 text-2xl font-semibold text-[#102132]">Avancer sans chercher</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = ICONS[action.id as keyof typeof ICONS] || Palette;
          const baseClassName = action.primary
            ? 'bg-[#102132] text-white border-[#102132]'
            : 'bg-[#F8F7F4] text-[#102132] border-[#E5E7EB]';

          if (action.external) {
            return (
              <a
                key={action.id}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className={`rounded-[24px] border p-5 transition-transform hover:-translate-y-0.5 ${baseClassName}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-[0.18em] opacity-70">Direct</span>
                </div>
                <p className="mt-4 text-lg font-semibold">{action.label}</p>
                <p className={`mt-2 text-sm ${action.primary ? 'text-white/75' : 'text-[#516173]'}`}>
                  {action.description}
                </p>
              </a>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className={`rounded-[24px] border p-5 transition-transform hover:-translate-y-0.5 ${baseClassName}`}
            >
              <div className="flex items-center justify-between gap-4">
                <Icon className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.18em] opacity-70">Action</span>
              </div>
              <p className="mt-4 text-lg font-semibold">{action.label}</p>
              <p className={`mt-2 text-sm ${action.primary ? 'text-white/75' : 'text-[#516173]'}`}>
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
