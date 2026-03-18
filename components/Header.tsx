'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Menu, X, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const name = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Vous';
                setUserName(name);
            }
        };
        void getUser();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-50 w-full bg-memoir-blue/95 backdrop-blur-xl py-6 transition-all duration-300 shadow-sm border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between relative"> {/* Added relative for mobile menu positioning context */}

                    {/* Partie Gauche : Socials + Menu (Desktop) */}
                    <div className="hidden md:flex items-center gap-12">
                        <Link href="/" className="relative block h-full w-auto hover:opacity-90 transition-opacity z-50 group">
                            <div className="absolute top-0 mt-[-2rem] left-0 w-32 h-32 md:w-36 md:h-36 bg-white rounded-full p-1 shadow-lg border-4 border-memoir-gold/20 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                <Image
                                    src="/logo.png"
                                    alt="Commun Vivant"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </Link>
                        {/* Spacer for the logo since it's absolute now */}
                        <div className="w-24 hidden md:block"></div>

                        <nav className="flex gap-8 text-white/90 text-sm font-medium tracking-wide uppercase" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <Link href="/" className="hover:text-memoir-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-memoir-gold after:transition-all hover:after:w-full">Accueil</Link>
                            <Link href="/#comment-ca-marche" className="hover:text-memoir-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-memoir-gold after:transition-all hover:after:w-full">Comment ça marche</Link>
                            <Link href="/supports-physiques" className="hover:text-memoir-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-memoir-gold after:transition-all hover:after:w-full">Objets & supports</Link>
                            <Link href="/faq" className="hover:text-memoir-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-memoir-gold after:transition-all hover:after:w-full">FAQ</Link>
                            <Link href="/a-propos" className="hover:text-memoir-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-memoir-gold after:transition-all hover:after:w-full">À propos</Link>
                        </nav>
                    </div>

                    {/* Logo Mobile (Centré ou Gauche) */}
                    <div className="md:hidden flex items-center">
                        <Link href="/" className="relative block z-50">
                            <div className="w-16 h-16 bg-white rounded-full p-1 shadow-md border-2 border-memoir-gold/20 overflow-hidden relative">
                                <Image
                                    src="/logo.png"
                                    alt="Commun Vivant"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Partie Droite : Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Socials discrets */}
                        <div className="flex gap-4 text-memoir-gold border-r border-white/10 pr-6">
                            <Instagram className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                            <Facebook className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                        </div>

                        <div className="flex gap-3 items-center">
                            {!user && (
                                <Link
                                    href="/login"
                                    className="text-white/70 hover:text-memoir-gold transition-colors text-xs font-semibold uppercase tracking-widest px-2"
                                    style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                    Espace Pro
                                </Link>
                            )}

                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="text-memoir-blue bg-white hover:bg-memoir-gold hover:text-white transition-all text-sm font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2"
                                    style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                    <User className="w-4 h-4" />
                                    Bienvenue, {userName}
                                </Link>
                            ) : (
                                <button
                                    onClick={() => router.push('/login')}
                                    className="text-memoir-blue bg-white hover:bg-memoir-gold hover:text-white transition-all text-sm font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl"
                                    style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                    Se connecter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-white p-2 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-8 h-8 text-memoir-gold" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full h-[calc(100vh-80px)] min-h-screen bg-memoir-blue z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right-10 duration-300 shadow-2xl pb-32">
                    <nav className="flex flex-col items-center gap-8 text-white text-xl font-light mt-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        <Link href="/" onClick={toggleMenu} className="hover:text-memoir-gold transition-colors">Accueil</Link>
                        <Link href="/#comment-ca-marche" onClick={toggleMenu} className="hover:text-memoir-gold transition-colors">Comment ça marche</Link>
                        <Link href="/supports-physiques" onClick={toggleMenu} className="hover:text-memoir-gold transition-colors">Objets & supports</Link>
                        <Link href="/faq" onClick={toggleMenu} className="hover:text-memoir-gold transition-colors">FAQ</Link>
                        <Link href="/a-propos" onClick={toggleMenu} className="hover:text-memoir-gold transition-colors">À propos</Link>
                    </nav>

                    <div className="h-px bg-white/10 w-full my-8 flex-shrink-0"></div>

                    <div className="flex flex-col gap-6 items-center w-full mb-8">
                        {user ? (
                            <Link
                                href="/dashboard"
                                onClick={toggleMenu}
                                className="bg-white text-memoir-blue px-8 py-4 rounded-full hover:bg-memoir-gold hover:text-white transition-colors text-lg font-bold w-full text-center shadow-lg"
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                            >
                                Bienvenue, {userName}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={toggleMenu}
                                    className="text-white/60 hover:text-memoir-gold transition-colors text-sm uppercase tracking-widest font-semibold"
                                    style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                    Espace Pro
                                </Link>
                                <button
                                    onClick={() => { router.push('/login'); toggleMenu(); }}
                                    className="bg-white text-memoir-blue px-8 py-4 rounded-full hover:bg-memoir-gold hover:text-white transition-colors text-lg font-bold w-full text-center shadow-lg"
                                    style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                    Se connecter
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
