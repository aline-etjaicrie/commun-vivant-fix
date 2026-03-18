'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Mock authentication
        setTimeout(() => {
            if (email === 'admin@pompes-funebres.fr' && password === 'admin') {
                router.push('/admin/dashboard');
            } else {
                setError('Identifiants incorrects. Essayez admin@pompes-funebres.fr / admin');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#C9A24D]/20">

                {/* Header */}
                <div className="bg-[#0F2A44] p-8 text-center">
                    <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4 font-serif italic text-2xl font-bold text-[#0F2A44]">
                        E
                    </div>
                    <h1 className="text-2xl text-white font-medium mb-1">Espace Partenaire</h1>
                    <p className="text-white/60 text-sm">Accès réservé aux professionnels</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant (Email)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F2A44] focus:border-transparent outline-none transition-all"
                                placeholder="nom@entreprise.fr"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F2A44] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0F2A44] text-white py-3 rounded-xl hover:bg-[#0F2A44]/90 transition-all font-medium flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <a href="#" className="text-xs text-gray-400 hover:text-[#0F2A44] underline">Mot de passe oublié ?</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
