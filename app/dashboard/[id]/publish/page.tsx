'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PublishPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#C9A24D]/20">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-serif text-[#0F2A44] mb-4">Mémorial Publié</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    L'espace mémoire de <strong>Marie Dubois</strong> est désormais accessible.
                    Vous pouvez le partager avec vos proches.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-mono truncate mr-4">
                        etjaicrie.fr/m/marie-dubois
                    </span>
                    <button className="text-[#C9A24D] hover:text-[#0F2A44] font-medium text-sm">
                        Copier
                    </button>
                </div>

                <div className="space-y-4">
                    <button className="w-full py-3 bg-[#0F2A44] text-white rounded-xl hover:bg-[#0F2A44]/90 transition px-6 flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Partager le mémorial
                    </button>

                    <button className="w-full py-3 bg-white border border-[#0F2A44]/10 text-[#0F2A44] rounded-xl hover:bg-gray-50 transition px-6 flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Gérer la confidentialité
                    </button>

                    <Link href={`/dashboard/${id}`} className="block text-sm text-gray-400 hover:text-gray-600 mt-6 underline">
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        </div>
    );
}
