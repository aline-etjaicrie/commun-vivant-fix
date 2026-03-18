import React from 'react';
import { Mail, MapPin, Globe, Shield } from 'lucide-react';
import Title from '@/components/Title';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-memoir-bg pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">

        <header className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif text-memoir-blue italic">Mentions Légales</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon mx-auto rounded-full" />
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-memoir-blue flex items-center gap-3">
              <Shield className="w-6 h-6 text-memoir-gold" />
              Éditeur du site
            </h2>
            <div className="pl-9 space-y-2 text-memoir-blue/80">
              <p>Le site Internet <strong>Commun Vivant</strong> est édité par :</p>
              <p className="font-semibold">L'entreprise "Et j'ai crié"</p>
              <p>Ayant son siège social en France.</p>
              <p className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-memoir-gold" />
                <a href="mailto:contact@etjaicrie.fr" className="hover:text-memoir-neon transition-colors">contact@etjaicrie.fr</a>
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-stone-100" />

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-memoir-blue flex items-center gap-3">
              <Globe className="w-6 h-6 text-memoir-gold" />
              Hébergement
            </h2>
            <div className="pl-9 space-y-2 text-memoir-blue/80">
              <p>Ce site est hébergé par la société <strong>Vercel Inc.</strong></p>
              <p>
                440 N Barranca Ave #4133<br />
                Covina, CA 91723<br />
                États-Unis
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-stone-100" />

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-memoir-blue flex items-center gap-3">
              <Shield className="w-6 h-6 text-memoir-gold" />
              Propriété Intellectuelle
            </h2>
            <div className="pl-9 space-y-4 text-memoir-blue/80 leading-relaxed">
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
