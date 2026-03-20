'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, Lock, Share2, Eye, Settings } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

type AccessLevel = 'ouvert' | 'restreint' | 'a_definir_plus_tard';

function PublishPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const rawLevel = searchParams?.get('accessLevel');
    const accessLevel: AccessLevel =
        rawLevel === 'restreint' || rawLevel === 'a_definir_plus_tard'
            ? rawLevel
            : 'ouvert';

    if (accessLevel === 'restreint') {
        return (
            <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#C9A24D]/20">
                    <div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-serif text-[#0F2A44] mb-4">Mémorial enregistré</h1>
                    <p className="text-gray-600 mb-2 leading-relaxed font-medium">
                        Accès restreint
                    </p>
                    <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                        Ce mémorial n'est pas accessible publiquement pour le moment.
                        Vous pouvez modifier ce réglage à tout moment depuis le tableau de bord.
                    </p>

                    <div className="space-y-4">
                        <Link
                            href={`/dashboard/${id}/personalize`}
                            className="w-full py-3 bg-[#0F2A44] text-white rounded-xl hover:bg-[#0F2A44]/90 transition px-6 flex items-center justify-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Gérer l'accès
                        </Link>

                        <Link href={`/dashboard/${id}`} className="block text-sm text-gray-400 hover:text-gray-600 mt-6 underline">
                            Retour au tableau de bord
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (accessLevel === 'a_definir_plus_tard') {
        return (
            <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#C9A24D]/20">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-serif text-[#0F2A44] mb-4">Mémorial enregistré</h1>
                    <p className="text-gray-600 mb-2 leading-relaxed font-medium">
                        Accès en attente
                    </p>
                    <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                        Ce mémorial a bien été préparé, mais son mode d'accès n'a pas encore été confirmé.
                        Revenez ici pour l'ouvrir quand vous êtes prêt.
                    </p>

                    <div className="space-y-4">
                        <Link
                            href={`/dashboard/${id}/personalize`}
                            className="w-full py-3 bg-[#0F2A44] text-white rounded-xl hover:bg-[#0F2A44]/90 transition px-6 flex items-center justify-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Confirmer l'accès
                        </Link>

                        <Link href={`/dashboard/${id}`} className="block text-sm text-gray-400 hover:text-gray-600 mt-6 underline">
                            Retour au tableau de bord
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Accès ouvert
    return (
        <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#C9A24D]/20">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-serif text-[#0F2A44] mb-4">Mémorial publié</h1>
                <p className="text-gray-600 mb-2 leading-relaxed font-medium">
                    Accès ouvert
                </p>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                    Toute personne disposant du lien, du QR code ou du support NFC peut consulter cette page.
                </p>

                <div className="space-y-4">
                    <Link
                        href={`/memorial/${id}`}
                        target="_blank"
                        className="w-full py-3 bg-[#0F2A44] text-white rounded-xl hover:bg-[#0F2A44]/90 transition px-6 flex items-center justify-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Voir la page
                    </Link>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + `/memorial/${id}`);
                        }}
                        className="w-full py-3 bg-white border border-[#0F2A44]/10 text-[#0F2A44] rounded-xl hover:bg-gray-50 transition px-6 flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Copier le lien
                    </button>

                    <Link href={`/dashboard/${id}`} className="block text-sm text-gray-400 hover:text-gray-600 mt-6 underline">
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PublishPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
                <p className="text-gray-400">Chargement…</p>
            </div>
        }>
            <PublishPageContent />
        </Suspense>
    );
}
