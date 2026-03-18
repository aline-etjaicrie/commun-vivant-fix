import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-[#0F2A44] p-4 text-center">
            <h1 className="text-6xl font-serif mb-4" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                404
            </h1>
            <h2 className="text-2xl font-serif mb-6">Page introuvable</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
                La page que vous recherchez n'existe pas ou a été déplacée.
            </p>

            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#C9A24D] text-white px-6 py-3 rounded-full hover:bg-[#B08D3B] transition-colors"
            >
                <Home className="w-4 h-4" />
                <span>Retour à l'accueil</span>
            </Link>
        </div>
    );
}
