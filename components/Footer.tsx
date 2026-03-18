import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-memoir-blue text-white/60 py-8 px-4 text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-medium text-white/80 mb-1">Et j'ai crié</p>
            <p className="text-xs">Marque sensible et éclairée</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link
              href="/eco-conception"
              className="hover:text-memoir-neon transition-colors"
            >
              Engagement Durable
            </Link>
          </nav>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-white/10 text-xs flex flex-col items-center gap-4">
          <p>© {new Date().getFullYear()} Et j'ai crié • Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
