'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Flame, Flower } from 'lucide-react';

// Mock memorial data
const MOCK_MEMORIAL = {
    name: 'Marie Dubois',
    birthDate: '15 mars 1945',
    deathDate: '12 janvier 2026',
    photo: '/image-site2.png',
    story: `Marie aimait les matins calmes. Elle prenait son café en silence, observant le jardin. Ces moments simples étaient les siens.

Elle a consacré sa vie à sa famille, toujours présente, toujours attentive. Ses petits-enfants se souviennent de ses histoires, de sa patience infinie, de son sourire qui apaisait tout.

Le jardin était son refuge. Elle y plantait des fleurs chaque printemps, avec la même délicatesse qu'elle mettait dans toutes ses actions. "Chaque fleur a son histoire", disait-elle.

Marie nous a quittés doucement, entourée de ceux qu'elle aimait. Elle laisse derrière elle un héritage de tendresse et de simplicité.`,
    gallery: [
        '/image-site1.png',
        '/image-site2.png',
        '/image-site5.png',
    ],
    approvedMessages: [
        {
            id: '1',
            author: 'Sophie L.',
            message: 'Merci Marie pour tout ce que tu nous as apporté. Tu resteras gravée dans nos cœurs.',
            date: '15 janvier 2026',
        },
        {
            id: '2',
            author: 'Paul M.',
            message: 'Une femme extraordinaire qui manquera à tous. Repose en paix.',
            date: '14 janvier 2026',
        },
    ],
    candles: 47,
    flowers: 23,
};

export default function PublicMemorialPage() {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState<'flame' | 'flower' | null>(null);

    const handleFlame = () => {
        setShowConfirmation('flame');
        setTimeout(() => setShowConfirmation(null), 3000);
    };

    const handleFlower = () => {
        setShowConfirmation('flower');
        setTimeout(() => setShowConfirmation(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
            {/* Header */}
            <header className="bg-white border-b border-[#C9A24D]/20">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Et j'ai crie" width={48} height={48} className="rounded-full" />
                        <span className="text-xl text-[#0F2A44] font-medium" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            Et j'ai crié
                        </span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[500px]">
                <div className="absolute inset-0">
                    <Image
                        src={MOCK_MEMORIAL.photo}
                        alt={MOCK_MEMORIAL.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A44] via-[#0F2A44]/60 to-transparent"></div>
                </div>

                <div className="relative h-full flex items-end">
                    <div className="w-full max-w-5xl mx-auto px-6 pb-12">
                        <h1 className="text-5xl md:text-6xl text-white mb-4 font-normal drop-shadow-lg" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            {MOCK_MEMORIAL.name}
                        </h1>
                        <p className="text-2xl text-[#C9A24D] italic">
                            {MOCK_MEMORIAL.birthDate} — {MOCK_MEMORIAL.deathDate}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Story */}
                <div className="prose prose-lg max-w-none mb-16">
                    {MOCK_MEMORIAL.story.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed mb-6 text-lg italic">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Gallery */}
                {MOCK_MEMORIAL.gallery.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl text-[#0F2A44] mb-8 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            Souvenirs en images
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {MOCK_MEMORIAL.gallery.map((img, idx) => (
                                <div key={idx} className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
                                    <Image
                                        src={img}
                                        alt={`Souvenir ${idx + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visitor Actions */}
                <div className="bg-white border border-[#C9A24D]/30 rounded-2xl p-8 md:p-12 mb-16">
                    <h2 className="text-3xl text-[#0F2A44] mb-8 font-normal text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                        Rendre hommage
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => setShowMessageModal(true)}
                            className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[#C9A24D]/30 hover:border-[#C9A24D] hover:shadow-lg transition-all group"
                        >
                            <MessageCircle className="w-12 h-12 text-[#C9A24D] group-hover:scale-110 transition-transform" />
                            <span className="text-lg text-[#0F2A44] font-medium">Laisser un message</span>
                        </button>

                        <button
                            onClick={handleFlame}
                            className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[#C9A24D]/30 hover:border-[#C9A24D] hover:shadow-lg transition-all group"
                        >
                            <Flame className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-lg text-[#0F2A44] font-medium">Allumer une flamme</span>
                        </button>

                        <button
                            onClick={handleFlower}
                            className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[#C9A24D]/30 hover:border-[#C9A24D] hover:shadow-lg transition-all group"
                        >
                            <Flower className="w-12 h-12 text-pink-400 group-hover:scale-110 transition-transform" />
                            <span className="text-lg text-[#0F2A44] font-medium">Déposer une fleur</span>
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 italic text-center mt-6">
                        Les contributions sont modérées pour préserver la dignité de cet espace.
                    </p>
                </div>

                {/* Approved Messages */}
                {MOCK_MEMORIAL.approvedMessages.length > 0 && (
                    <div>
                        <h2 className="text-3xl text-[#0F2A44] mb-8 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            Messages
                        </h2>
                        <div className="space-y-6">
                            {MOCK_MEMORIAL.approvedMessages.map((msg) => (
                                <div key={msg.id} className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="font-medium text-[#0F2A44]">{msg.author}</p>
                                        <p className="text-sm text-gray-500">{msg.date}</p>
                                    </div>
                                    <p className="text-gray-700 italic leading-relaxed">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
                        <h3 className="text-2xl text-[#0F2A44] mb-6 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            Laisser un message
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[#0F2A44] font-medium mb-2">
                                    Votre nom (optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Anonyme"
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#0F2A44] font-medium mb-2">
                                    Votre message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Partagez un souvenir, un hommage..."
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] resize-none"
                                />
                            </div>

                            <p className="text-sm text-gray-500 italic">
                                Votre message sera visible après modération.
                            </p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    alert('Votre message a été envoyé et sera visible après modération.');
                                    setShowMessageModal(false);
                                }}
                                className="flex-1 px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg hover:bg-[#E1C97A] transition-colors font-medium"
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Toast */}
            {showConfirmation && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F2A44] text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-in slide-in-from-bottom-5">
                    {showConfirmation === 'flame' && '🕯️ Flamme allumée'}
                    {showConfirmation === 'flower' && '🌸 Fleur déposée'}
                </div>
            )}

            {/* Footer */}
            <footer className="border-t border-[#C9A24D]/20 py-8 bg-white mt-20">
                <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500">
                    <p>Créé avec ❤️ sur Et j'ai crié</p>
                </div>
            </footer>
        </div>
    );
}
