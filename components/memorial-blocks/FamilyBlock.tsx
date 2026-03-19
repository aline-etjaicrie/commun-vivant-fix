'use client';

import { Users } from 'lucide-react';
import RawImage from '@/components/RawImage';

interface FamilyBlockProps {
    template: any;
    isLightBg: boolean;
    story?: string;
    members?: Array<{ prenom?: string; nom?: string; role?: string; photoUrl?: string }>;
    pdfUrl?: string;
    pdfName?: string;
}

export default function FamilyBlock({ template, isLightBg, story, members = [], pdfUrl, pdfName }: FamilyBlockProps) {
    const cleanMembers = members.filter((m) => m.prenom || m.nom || m.role || m.photoUrl);
    const hasStory = Boolean(String(story || '').trim());
    const hasPdf = Boolean(String(pdfUrl || '').trim());

    if (!hasStory && cleanMembers.length === 0 && !hasPdf) {
        return null;
    }

    return (
        <div
            className="rounded-[30px] border p-7 shadow-[0_24px_70px_rgba(15,23,38,0.08)] md:p-8"
            style={{
                backgroundColor: isLightBg ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${template.colors.accent}20`
            }}
        >
            <div className="mb-5 flex items-center gap-3">
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${template.colors.accent}15`, color: template.colors.accent }}
                >
                    <Users className="h-6 w-6" />
                </div>
                <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: template.colors.accent }}>
                    Transmission
                </p>
                <h3
                    className="mt-2 text-[1.85rem] font-serif leading-tight"
                    style={{ color: template.colors.text }}
                >
                    Arbre généalogique
                </h3>
                </div>
            </div>

            <p className="mb-7 mt-4 text-[1.02rem] leading-8 opacity-80" style={{ color: template.colors.text }}>
                {hasStory
                    ? story
                    : "L'histoire se transmet de génération en génération. Une lignée de souvenirs qui unit le passé et le futur."}
            </p>

            {cleanMembers.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                    {cleanMembers.map((m, i) => (
                        <div
                            key={`member-${i}`}
                            className="flex items-center gap-3 rounded-[22px] border px-4 py-4"
                            style={{
                                borderColor: `${template.colors.accent}33`,
                                backgroundColor: isLightBg ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'
                            }}
                        >
                            {m.photoUrl ? (
                                <RawImage src={m.photoUrl} alt={`${m.prenom || ''} ${m.nom || ''}`.trim()} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/10 text-xs uppercase tracking-[0.18em]" style={{ color: template.colors.accent }}>
                                    {((m.prenom || m.nom || 'M').trim()[0] || 'M').toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-medium" style={{ color: template.colors.text }}>{[m.prenom, m.nom].filter(Boolean).join(' ').trim() || 'Membre'}</p>
                                {m.role ? <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-70" style={{ color: template.colors.text }}>{m.role}</p> : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                {pdfUrl ? (
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={pdfName || 'arbre-genealogique.pdf'}
                        className="block rounded-[24px] border p-5 text-left transition hover:bg-black/5"
                        style={{ borderColor: `${template.colors.accent}35`, color: template.colors.text }}
                    >
                        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: template.colors.accent }}>
                            Document
                        </p>
                        <p className="mt-2 text-lg font-medium">
                            {pdfName || "Arbre généalogique"}
                        </p>
                        <p className="mt-2 text-sm leading-6 opacity-70">
                            Ouvrir le document et retrouver cette branche du récit dans un format séparé.
                        </p>
                    </a>
                ) : (
                    <div className="inline-block rounded-full border px-4 py-2 text-sm opacity-50" style={{ borderColor: template.colors.accent, color: template.colors.text }}>
                        L'arbre est en cours de construction
                    </div>
                )}
            </div>
        </div>
    );
}
