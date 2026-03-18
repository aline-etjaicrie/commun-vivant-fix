import React from 'react';
import { Mail, Trash2, HelpCircle, CheckCircle } from 'lucide-react';

export default function DroitOubliPage() {
  return (
    <div className="min-h-screen bg-memoir-bg pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">

        <header className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif text-memoir-blue italic">Droit à l'oubli</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon mx-auto rounded-full" />
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-memoir-blue flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-memoir-gold" />
              Qu'est-ce que le droit à l'oubli ?
            </h2>
            <p className="text-memoir-blue/80 leading-relaxed">
              Le droit à l'oubli (ou droit à l'effacement) permet à tout utilisateur de demander le retrait de données personnelles
              publiées sur internet, lorsqu'elles portent atteinte à sa vie privée ou ne sont plus pertinentes.
            </p>
          </div>

          <div className="w-full h-px bg-stone-100" />

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-memoir-blue flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-memoir-neon" />
              Supprimer un mémorial ou des données
            </h2>
            <div className="text-memoir-blue/80 space-y-4 leading-relaxed">
              <p>
                Chez <strong>Commun Vivant</strong>, vous gardez le contrôle total. Si vous souhaitez supprimer un mémorial
                que vous avez créé ou faire retirer votre nom/photo d'un espace existant, la procédure est simple :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Envoyez votre demande par email à <strong>contact@etjaicrie.fr</strong>.</span>
                </li>
                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Précisez l'URL du mémorial concerné et les éléments à supprimer.</span>
                </li>
                <li className="flex items-start gap-3 bg-stone-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Nous traiterons votre demande sous 48h ouvrées.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-memoir-blue/5 p-6 rounded-xl border border-memoir-blue/10">
            <p className="text-sm text-memoir-blue/70 italic text-center">
              Note : La suppression est définitive et irréversible. Les données effacées ne pourront pas être récupérées.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}
