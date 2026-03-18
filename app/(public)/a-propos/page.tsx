'use client';


import Link from 'next/link';
import { Heart, Clock, Box, Users, PenTool, Share2, Anchor, Mail, ArrowRight, XCircle, CheckCircle, Leaf } from 'lucide-react';

export default function AproposPage() {
    return (
        <div className="min-h-screen bg-memoir-bg flex flex-col font-sans text-memoir-blue">

            <main className="flex-grow w-full">

                {/* Hero Section */}
                <section className="relative py-24 px-6 overflow-hidden">
                    {/* Pink/Neon Blob added for 'gai' effect */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-memoir-neon/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-memoir-blue/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                        <span className="inline-block px-4 py-1.5 bg-memoir-gold/10 text-memoir-gold rounded-full text-xs font-bold tracking-widest uppercase border border-memoir-gold/20">
                            Notre mission
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif italic text-memoir-blue">
                            Le lien est plus fort <br />
                            <span className="text-memoir-gold">que le temps</span>
                            <span className="text-memoir-neon">.</span>
                        </h1>
                    </div>
                </section>

                {/* Grid Situations - Reformulée pour être plus universelle */}
                <section className="px-6 pb-20">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Heart,
                                text: "Parce que nos souvenirs sont les fondations de ce que nous sommes, aujourd'hui et demain.",
                                color: "text-memoir-neon"
                            },
                            {
                                icon: Clock,
                                text: "Parce qu'il est urgent de capturer la voix, les mots et les histoires de ceux qu'on aime.",
                                color: "text-memoir-gold"
                            },
                            {
                                icon: Users,
                                text: "Parce qu'une vie raconte toujours plus qu'une simple biographie : elle raconte une époque, un lien, un amour.",
                                color: "text-memoir-blue"
                            },
                            {
                                icon: Share2,
                                text: "Parce que transmettre, c'est offrir aux générations futures des racines pour grandir.",
                                color: "text-memoir-blue"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-memoir-blue/5 hover:shadow-md transition-all group hover:border-memoir-neon/20">
                                <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
                                <p className="text-memoir-blue/80 leading-relaxed font-medium">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* La Genèse - Moins funéraire, plus transmission */}
                <section className="py-20 px-6 bg-white relative">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-3xl font-serif italic text-memoir-blue mb-8">
                            D'où vient Commun Vivant ?
                        </h2>

                        <div className="prose prose-lg text-memoir-blue/70">
                            <p>
                                Tout part d'un constat simple : nous avons tous, autour de nous, des histoires incroyables qui risquent de s'éteindre en silence.
                            </p>
                            <p>
                                Combien de fois nous sommes-nous dit : <em>"J'aurais dû l'enregistrer"</em>, <em>"Je ne me souviens plus de la recette exacte"</em> ou <em>"Pourquoi je n'ai pas posé cette question ?"</em>
                            </p>
                            <p>
                                Commun Vivant est né de cette volonté de ne pas laisser le temps effacer l'essentiel.
                                Ce n'est pas un projet sur la fin, c'est un projet sur la <strong>continuité</strong>.
                            </p>

                            <div className="bg-memoir-bg p-8 rounded-2xl border-l-4 border-memoir-gold my-8 italic text-memoir-blue font-serif text-xl border-y border-r border-memoir-blue/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-memoir-neon/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                                <span className="relative z-10">
                                    "Transmettre, ce n'est pas regarder en arrière. C'est donner de la force pour l'avenir."
                                </span>
                            </div>

                            <p>
                                Que ce soit pour honorer une mémoire, célébrer une étape de vie, ou donner une âme à des objets,
                                la démarche est la même : prendre le temps de dire, de raconter, et de relier.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Ce que Commun Vivant permet */}
                <section className="py-20 px-6 bg-memoir-blue text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-memoir-gold/10 rounded-full blur-[120px] mix-blend-overlay" />

                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-serif italic mb-6">
                                Un espace pour le vivant
                                <span className="text-memoir-neon">.</span>
                            </h2>
                            <p className="text-xl text-white/80 mb-8 font-light">
                                Plus qu'un mémorial, un lieu de partage et de retrouvailles.
                            </p>

                            <Link href="/create" className="inline-flex items-center gap-2 bg-memoir-gold text-memoir-blue px-8 py-4 rounded-full font-bold hover:bg-white transition-all">
                                Commencer un récit <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                            <ul className="space-y-6">
                                {[
                                    { icon: Users, text: "Fédérer une communauté autour d'une histoire commune" },
                                    { icon: PenTool, text: "Écrire facilement grâce à une technologie bienveillante" },
                                    { icon: Anchor, text: "Ancrer les souvenirs dans le quotidien (objets, lieux)" }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <item.icon className="w-6 h-6 text-memoir-gold flex-shrink-0 mt-1" />
                                        <span className="text-white/90 leading-relaxed font-light text-lg">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Qui porte ce projet */}
                <section className="py-24 px-6 bg-white border-t border-memoir-blue/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                        <div className="md:col-span-1">
                            <div className="relative aspect-square rounded-full overflow-hidden border-4 border-memoir-gold/20 shadow-xl max-w-[200px] mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                                {/* Placeholder Aline */}
                                <div className="absolute inset-0 bg-memoir-blue/10 flex items-center justify-center text-memoir-blue/40 font-serif italic">
                                    Portrait
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-6 text-center md:text-left">
                            <h3 className="text-2xl font-serif italic text-memoir-blue">Une démarche artisanale et sincère</h3>
                            <p className="text-memoir-blue/70 leading-relaxed">
                                Je m'appelle Aline. Ce projet est né d'un parcours personnel, mais il grandit grâce à vos histoires.
                                Commun Vivant est construit avec cœur, loin des logiques industrielles.
                            </p>
                            <p className="text-memoir-blue/70">
                                Ici, chaque récit compte. Chaque mémoire est traitée avec le respect qu'elle mérite.
                            </p>
                            <p className="text-sm text-memoir-blue/50 italic pt-2">
                                <Link href="/eco-conception" className="hover:text-memoir-gold transition-colors flex items-center gap-1.5">
                                    <Leaf className="w-3 h-3" />
                                    Commun Vivant est conçu de manière sobre et responsable (éco-conception).
                                </Link>
                            </p>
                            <div className="pt-4">
                                <Link href="mailto:contact@etjaicrie.fr" className="text-memoir-gold font-bold hover:text-memoir-neon transition-colors underline decoration-memoir-gold/30 underline-offset-4">
                                    M'écrire personnellement
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
