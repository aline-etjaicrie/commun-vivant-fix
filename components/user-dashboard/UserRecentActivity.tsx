import Link from 'next/link';
import { Flame, MessageSquare, Sparkles } from 'lucide-react';
import {
  formatRelativeDate,
  type DashboardActivityItem,
} from '@/lib/user-dashboard/presentation';

function ActivityIcon({ type }: { type: DashboardActivityItem['type'] }) {
  if (type === 'candle') return <Flame className="h-4 w-4" />;
  if (type === 'collaboration') return <Sparkles className="h-4 w-4" />;
  return <MessageSquare className="h-4 w-4" />;
}

export default function UserRecentActivity({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Activité récente</p>
        <h3 className="mt-2 text-2xl font-semibold text-[#102132]">Ce qui s’est passé récemment</h3>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#D6D8DD] bg-[#F8F7F4] p-5 text-sm text-[#6B7280]">
          Aucun mouvement récent pour le moment. Dès qu’un proche contribue ou qu’un message arrive, vous le verrez ici.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start gap-4 rounded-[22px] border border-[#E5E7EB] bg-[#FBFBFA] p-4 transition-colors hover:bg-white"
            >
              <div className="mt-0.5 rounded-full bg-[#EEF2F7] p-2 text-[#102132]">
                <ActivityIcon type={item.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-[#102132]">{item.title}</p>
                  <span className="text-xs text-[#6B7280]">{formatRelativeDate(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#516173]">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
