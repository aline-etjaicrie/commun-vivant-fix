'use client';

import Link from 'next/link';
import { ArrowLeft, Box, CheckCircle2, QrCode, Smartphone } from 'lucide-react';

export default function SupportsPhysiquesPage() {
    return (
        <div className="min-h-screen bg-memoir-bg flex flex-col font-sans">

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-memoir-blue py-20 px-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-memoir-gold/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium mb-8">
                            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-serif italic">Le lien entre mémoire et matière</h1>
                        <p className="text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
                            Un objet, une tombe, un cadre photo : le numérique prend sens quand il est ancré dans le réel.
                            Nos supports permettent d'accéder à la mémoire en ligne d'un simple geste.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">

                    {/* Puce NFC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 space-y-8">
                            <div className="bg-memoir-neon/10 text-memoir-neon w-16 h-16 rounded-2xl flex items-center justify-center">
                                <Smartphone className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif text-memoir-blue mb-2">Puce NFC</h2>
                                <p className="text-memoir-blue/60 text-lg uppercase tracking-widest font-bold">Pour les objets</p>
                            </div>
                            <p className="text-memoir-blue/70 text-lg leading-relaxed">
                                Une pastille discrète qui se colle sous ou derrière votre objet.
                                Invisible, elle révèle l'histoire quand on l'approche.
                            </p>

                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-memoir-blue/5 space-y-6">
                                <h3 className="text-memoir-blue font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-memoir-gold" /> Caractéristiques
                                </h3>
                                <ul className="space-y-3 text-memoir-blue/70">
                                    <li>• Format : pastille noire Ø25mm, épaisseur 3-5mm</li>
                                    <li>• Anti-métal : fonctionne sur tous matériaux (bois, métal, verre...)</li>
                                    <li>• Adhésif résistant 3M</li>
                                    <li>• Lecture instantanée : approchez votre smartphone à 1-2 cm</li>
                                    <li>• Compatible iOS (iPhone 7+) et Android (NFC activé)</li>
                                    <li>• Aucune application nécessaire</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <p className="font-bold text-memoir-blue">Comment ça marche ?</p>
                                <ol className="list-decimal list-inside space-y-2 text-memoir-blue/70">
                                    <li>Collez la puce sous/derrière votre objet</li>
                                    <li>Approchez votre smartphone (1-2 cm)</li>
                                    <li>L'histoire s'affiche automatiquement</li>
                                </ol>
                            </div>

                            <div className="pt-4 flex gap-4 text-sm font-medium">
                                <span className="bg-memoir-gold/10 text-memoir-gold px-4 py-2 rounded-full">Inclus dans : Mémoire d'objet (15€)</span>
                                <span className="bg-memoir-blue/5 text-memoir-blue/60 px-4 py-2 rounded-full">Option : +10€ pour Personne</span>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 bg-gray-100 rounded-3xl h-[500px] relative overflow-hidden shadow-2xl">
                            {/* Placeholder visual for NFC usage */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                [Visuel Puce NFC sous un objet]
                            </div>
                        </div>
                    </div>

                    {/* Plaque QR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="bg-gray-100 rounded-3xl h-[500px] relative overflow-hidden shadow-2xl">
                            {/* Placeholder visual for QR usage */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                [Visuel Plaque QR sur tombe/cadre]
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-memoir-blue/10 text-memoir-blue w-16 h-16 rounded-2xl flex items-center justify-center">
                                <QrCode className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif text-memoir-blue mb-2">Plaque QR</h2>
                                <p className="text-memoir-blue/60 text-lg uppercase tracking-widest font-bold">Pour les personnes</p>
                            </div>
                            <p className="text-memoir-blue/70 text-lg leading-relaxed">
                                Une mini-plaque élégante à fixer là où elle fait sens :
                                sur une tombe, un cadre photo, un mur ou un lieu symbolique.
                            </p>

                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-memoir-blue/5 space-y-6">
                                <h3 className="text-memoir-blue font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-memoir-gold" /> Caractéristiques
                                </h3>
                                <ul className="space-y-3 text-memoir-blue/70">
                                    <li>• Format : mini-plaque 5x5cm ou 6x4cm</li>
                                    <li>• Matériau résistant aux intempéries (extérieur/intérieur)</li>
                                    <li>• Scannable par tous les smartphones (appareil photo)</li>
                                    <li>• Design sobre et respectueux</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <p className="font-bold text-memoir-blue">Comment ça marche ?</p>
                                <ol className="list-decimal list-inside space-y-2 text-memoir-blue/70">
                                    <li>Fixez la plaque (adhésif ou vis selon support)</li>
                                    <li>Scannez le QR code avec l'appareil photo</li>
                                    <li>La mémoire s'ouvre dans le navigateur</li>
                                </ol>
                            </div>

                            <div className="pt-4 flex gap-4 text-sm font-medium">
                                <span className="bg-memoir-blue text-white px-4 py-2 rounded-full shadow-lg">Inclus dans : Mémoire de personne (79€)</span>
                                <span className="bg-memoir-blue/5 text-memoir-blue/60 px-4 py-2 rounded-full">Option : +5€ pour Objet</span>
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="bg-white rounded-[40px] p-12 text-center border border-memoir-gold/20 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <h3 className="text-2xl font-serif text-memoir-blue italic">Vous souhaitez partager le lien physique avec plusieurs proches ?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                                <div className="bg-memoir-bg p-6 rounded-2xl">
                                    <h4 className="font-bold text-memoir-blue mb-2">Plaques QR supplémentaires</h4>
                                    <p className="text-3xl font-serif text-memoir-gold mb-2">5€ <span className="text-sm text-memoir-blue/40 font-sans">/ unité</span></p>
                                    <p className="text-sm text-memoir-blue/60">Idéal pour offrir aux enfants ou placer sur plusieurs lieux.</p>
                                </div>
                                <div className="bg-memoir-bg p-6 rounded-2xl">
                                    <h4 className="font-bold text-memoir-blue mb-2">Puces NFC supplémentaires</h4>
                                    <p className="text-3xl font-serif text-memoir-neon mb-2">5€ <span className="text-sm text-memoir-blue/40 font-sans">/ unité</span></p>
                                    <p className="text-sm text-memoir-blue/60">Pour partager l'accès à l'histoire d'un objet.</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-memoir-gold/10">
                                <h4 className="text-memoir-blue font-bold mb-2">Bientôt disponible : Supports Premium</h4>
                                <p className="text-memoir-blue/60">Plaque laiton gravée, marbre gravé, médaillon NFC design.</p>
                                <Link href="/#newsletter" className="text-memoir-gold underline mt-2 inline-block hover:text-memoir-blue transition-colors">Prévenez-moi du lancement</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="bg-white py-12 text-center border-t border-memoir-gold/10">
                <p className="text-memoir-blue/40 text-sm">© 2026 Commun Vivant • <Link href="/faq" className="hover:text-memoir-gold underline">Questions fréquentes</Link></p>
            </footer>
        </div>
    );
}
