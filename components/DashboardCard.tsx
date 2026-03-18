'use client';

import Image from 'next/image';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface DashboardCardProps {
    memorial: {
        id: string;
        name: string;
        photo?: string;
        status: 'brouillon' | 'en-cours' | 'publie';
        contributors: {
            completed: number;
            total: number;
        };
        pendingMessages?: number;
        createdAt: string;
    };
}

export default function DashboardCard({ memorial }: DashboardCardProps) {
    return (
        <Link href={`/dashboard/${memorial.id}`}>
            <div className="group bg-white border border-[#C9A24D]/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-[#C9A24D]/50 transition-all duration-300 cursor-pointer">
                {/* Image */}
                <div className="relative h-48 bg-[#0F2A44]/5">
                    {memorial.photo ? (
                        <Image
                            src={memorial.photo}
                            alt={memorial.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#0F2A44]/30">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl text-[#0F2A44] font-medium group-hover:text-[#C9A24D] transition-colors" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            {memorial.name}
                        </h3>
                        <StatusBadge status={memorial.status} />
                    </div>

                    <p className="text-sm text-gray-500 mb-4">{memorial.createdAt}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#C9A24D]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span>{memorial.contributors.completed}/{memorial.contributors.total} contributeurs</span>
                        </div>

                        {memorial.pendingMessages ? (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-amber-600">{memorial.pendingMessages} en attente</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}
