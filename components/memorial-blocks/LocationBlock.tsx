'use client';

import { MapPin, Calendar, Clock } from 'lucide-react';

interface LocationBlockProps {
    template: any;
    isLightBg: boolean;
    location?: {
        type?: string;
        address?: string;
        ceremonyDate?: string;
        ceremonyTime?: string;
    } | null;
}

export default function LocationBlock({ template, isLightBg, location }: LocationBlockProps) {
    const dateLabel = location?.ceremonyDate || 'À venir';
    const hourLabel = location?.ceremonyTime || '--:--';
    const addressLabel = location?.address || 'Informations bientôt disponibles';

    return (
        <div
            className="rounded-xl shadow p-8"
            style={{
                backgroundColor: isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${template.colors.accent}20`
            }}
        >
            <h3
                className="text-2xl font-bold mb-8 flex items-center gap-3"
                style={{ color: template.colors.text }}
            >
                <MapPin className="w-6 h-6" style={{ color: template.colors.accent }} />
                Cérémonie & Hommage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="mt-1" style={{ color: template.colors.accent }}>
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm uppercase tracking-widest opacity-60 mb-1" style={{ color: template.colors.text }}>Date</div>
                            <div className="text-lg font-medium" style={{ color: template.colors.text }}>{dateLabel}</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1" style={{ color: template.colors.accent }}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm uppercase tracking-widest opacity-60 mb-1" style={{ color: template.colors.text }}>Heure</div>
                            <div className="text-lg font-medium" style={{ color: template.colors.text }}>{hourLabel}</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1" style={{ color: template.colors.accent }}>
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm uppercase tracking-widest opacity-60 mb-1" style={{ color: template.colors.text }}>Lieu</div>
                            <div className="text-lg font-medium leading-tight" style={{ color: template.colors.text }}>{addressLabel}</div>
                        </div>
                    </div>
                </div>

                <div className="h-48 bg-black/10 rounded-lg flex items-center justify-center border border-dashed border-black/20 overflow-hidden relative">
                    <div
                        className="absolute inset-0 opacity-10 bg-cover"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop')` }}
                    />
                    <span className="relative z-10 text-sm italic opacity-50" style={{ color: template.colors.text }}>Carte interactive</span>
                </div>
            </div>
        </div>
    );
}
