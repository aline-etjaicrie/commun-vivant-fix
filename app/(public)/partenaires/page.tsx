import React from 'react';
import Link from 'next/link';

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SECTION: VOUS ÊTES UN·E PROFESSIONNEL·LE ? */}
      <section className="py-24 px-6 bg-[#2B5F7D]">
        <div className="max-w-6xl mx-auto">

          {/* Titre */}
          <h2 className="text-4xl md:text-5xl text-white text-center mb-6 font-light">
            <span className="italic">VOUS ÊTES UN·E</span><br />
            <span className="italic">PROFESSIONNEL·LE</span> <span className="text-[#D4AF37]">?</span>
          </h2>

          {/* Sous-titre */}
          <p className="text-white/90 text-center text-lg md:text-xl max-w-4xl mx-auto mb-16 leading-relaxed">
            Assureur·es, pompes funèbres, artisan·es, antiquaires, collectivités, entreprises : nous
            concevons des solutions sur mesure pour enrichir votre offre et accompagner vos client·es,
            salarié·es ou bénéficiaires.
          </p>

          {/* Grille 2x2 */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">

            {/* Card 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Cadeaux d'entreprise à dimension artisanale et mémorielle
                </p>
              </div>
            </div>

            {/* Card 2 - TEXTE MIS À JOUR */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Transmission et mémoire des équipes, des agent·es et des métiers invisibilisés
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Valorisation de parcours professionnels, de savoir-faire et d'histoires collectives
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Accompagnement des familles et des proches dans des moments sensibles
                </p>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/espace-pro"
              className="inline-block px-12 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full text-lg font-medium hover:bg-[#D4AF37] hover:text-[#2B5F7D] transition-all"
            >
              Consulter l'Espace Pro
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
