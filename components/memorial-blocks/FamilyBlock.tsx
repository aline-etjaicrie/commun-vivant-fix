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

    return (
        <div
            className="rounded-xl shadow p-8 text-center"
            style={{
                backgroundColor: isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${template.colors.accent}20`
            }}
        >
            <div className="flex justify-center mb-6">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${template.colors.accent}15`, color: template.colors.accent }}
                >
                    <Users className="w-8 h-8" />
                </div>
            </div>

            <h3
                className="text-2xl font-bold mb-4"
                style={{ color: template.colors.text }}
            >
                Arbre Généalogique
            </h3>

            <p className="text-lg italic opacity-70 leading-relaxed mb-6" style={{ color: template.colors.text }}>
                {story?.trim()
                    ? story
                    : "L'histoire se transmet de génération en génération. Une lignée de souvenirs qui unit le passé et le futur."}
            </p>

            {cleanMembers.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {cleanMembers.map((m, i) => (
                        <div key={`member-${i}`} className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: `${template.colors.accent}44` }}>
                            {m.photoUrl ? (
                                <RawImage src={m.photoUrl} alt={`${m.prenom || ''} ${m.nom || ''}`.trim()} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-black/10" />
                            )}
                            <div>
                                <p className="font-medium" style={{ color: template.colors.text }}>{[m.prenom, m.nom].filter(Boolean).join(' ').trim() || 'Membre'}</p>
                                {m.role ? <p className="text-xs opacity-70" style={{ color: template.colors.text }}>{m.role}</p> : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pdfUrl ? (
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={pdfName || 'arbre-genealogique.pdf'}
                    className="mt-4 inline-block px-4 py-2 rounded-full border text-sm"
                    style={{ borderColor: template.colors.accent, color: template.colors.text }}
                >
                    Télécharger l'arbre (PDF){pdfName ? ` - ${pdfName}` : ''}
                </a>
            ) : (
                <div className="inline-block px-4 py-2 rounded-full border text-sm opacity-50" style={{ borderColor: template.colors.accent, color: template.colors.text }}>
                    L'arbre est en cours de construction
                </div>
            )}
        </div>
    );
}
