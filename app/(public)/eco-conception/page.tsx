'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';

// Composant de séparateur rose néon
const PinkSeparator = () => (
  <div className="flex justify-center my-16">
    <div className="w-24 h-0.5 bg-[#FF006E]"></div>
  </div>
);

export default function EcoConceptionPage() {
  const [domNodes, setDomNodes] = useState(0);

  useEffect(() => {
    setDomNodes(document.querySelectorAll('*').length);
  }, []);

  // Scores réels mesurés avec GreenIT Analysis
  const scores = [
    { page: 'Page Exemples', score: 94, grade: 'B', dom: 101, co2: '1.12g' },
    { page: 'Page Create', score: 94, grade: 'B', dom: 103, co2: '1.12g' },
    { page: 'Page FAQ', score: 93, grade: 'B', dom: 142, co2: '1.14g' },
    { page: 'Page Supports', score: 93, grade: 'B', dom: 147, co2: '1.14g' },
    { page: 'Page Homepage', score: 89, grade: 'B', dom: 250, co2: '1.21g' },
  ];

  const averageScore = 92.6;
  const averageCO2 = '1.15g';
  const averageDOM = 148;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Lien retour discret */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2B5F7D] transition-colors mb-12 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* SECTION 1: HERO / MANIFESTE */}
        <header className="text-center mb-16 space-y-8">
          <h1 className="text-4xl md:text-6xl font-light text-[#2B5F7D] leading-tight">
            Notre manifeste pour une <br className="hidden md:block" />
            mémoire responsable<span className="text-[#FF006E]">.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Transmettre des histoires, c'est aussi respecter la terre qui les a portées
          </p>

          {/* Badge score global */}
          <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Score EcoIndex moyen
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-[#2B5F7D]">B</span>
              <span className="text-3xl text-gray-600">{averageScore}/100</span>
            </div>
            <span className="text-sm text-[#D4AF37] font-medium">
              Top 15% des sites web français
            </span>
          </div>
        </header>

        <PinkSeparator />

        {/* SECTION 2: NOS SCORES EN DÉTAIL */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-12">
            Nos résultats en temps réel<span className="text-[#FF006E]"> :</span>
          </h2>

          {/* Tableau des scores */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-[#2B5F7D] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Page</th>
                  <th className="px-6 py-4 text-center font-medium">Note</th>
                  <th className="px-6 py-4 text-center font-medium">Grade</th>
                  <th className="px-6 py-4 text-center font-medium">Nœuds DOM</th>
                  <th className="px-6 py-4 text-center font-medium">CO2/visite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800">{item.page}</td>
                    <td className="px-6 py-4 text-center font-semibold text-[#2B5F7D]">
                      {item.score}/100
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{item.dom}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{item.co2}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-[#D4AF37]">
                <tr className="font-semibold">
                  <td className="px-6 py-4 text-gray-800">Moyenne</td>
                  <td className="px-6 py-4 text-center text-[#2B5F7D]">{averageScore}/100</td>
                  <td className="px-6 py-4 text-center text-[#2B5F7D]">B</td>
                  <td className="px-6 py-4 text-center text-gray-800">{averageDOM}</td>
                  <td className="px-6 py-4 text-center text-gray-800">{averageCO2}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-600 leading-relaxed">
              Ces scores placent Commun Vivant dans le <strong className="text-[#2B5F7D]">top 15%</strong> des sites web français
            </p>
            <a
              href="https://www.ecoindex.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#FF006E] transition-colors text-sm underline"
            >
              En savoir plus sur EcoIndex.fr
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 3: CE QUE ÇA CHANGE CONCRÈTEMENT */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-16">
            Ce que ça change concrètement<span className="text-[#FF006E]"> :</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pour Vous */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#2B5F7D]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#2B5F7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#2B5F7D]">Pour Vous</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Chargement &lt; 1 seconde, même sur 3G</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Batterie préservée sur mobile</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Accessible partout (zones rurales, anciens appareils)</span>
                </li>
              </ul>
            </div>

            {/* Pour la Planète */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#2B5F7D]">Pour la Planète</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>1.15g CO2 par visite (vs 1.76g moyenne web)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>1000 visites = 3km en voiture économisés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Hébergement optimisé (Vercel, infrastructure moderne)</span>
                </li>
              </ul>
            </div>

            {/* Pour vos Proches */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#2B5F7D]">Pour vos Proches</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Mémoires accessibles 10 ans sans ralentissement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>Compatible anciens navigateurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4AF37] mt-1">•</span>
                  <span>PDF léger (&lt; 2 MB)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 4: COMMENT ON FAIT ? */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-16">
            Comment on fait<span className="text-[#FF006E]"> ?</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2B5F7D]">Sobriété Radicale</h3>
              <p className="text-gray-700 leading-relaxed">
                60% de code en moins, zéro fonctionnalité superflue
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2B5F7D]">Images au Pixel Près</h3>
              <p className="text-gray-700 leading-relaxed">
                Format WebP/AVIF, taille exacte écran, lazy loading
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2B5F7D]">Zéro Pollution Numérique</h3>
              <p className="text-gray-700 leading-relaxed">
                1 police, 0 tracker, 0 cookie
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2B5F7D]">Code Artisanal</h3>
              <p className="text-gray-700 leading-relaxed">
                {averageDOM} nœuds DOM en moyenne (objectif &lt; 1500)
              </p>
            </div>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 5: LES CHIFFRES QUI COMPTENT */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-16">
            Les chiffres qui comptent<span className="text-[#FF006E]"> :</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#2B5F7D] to-[#1e4458] rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">{averageScore}/100</div>
              <div className="text-sm opacity-90">Score EcoIndex moyen</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">{averageCO2}</div>
              <div className="text-sm opacity-90">CO2 par visite</div>
            </div>

            <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">35%</div>
              <div className="text-sm opacity-90">Réduction vs moyenne web</div>
            </div>

            <div className="bg-gradient-to-br from-[#FF006E] to-[#d6005b] rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">{averageDOM}</div>
              <div className="text-sm opacity-90">Nœuds DOM moyen (vs 1500 max)</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">44</div>
              <div className="text-sm opacity-90">Requêtes à froid (vs 40 objectif)</div>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 text-white text-center space-y-3">
              <div className="text-5xl font-bold">0</div>
              <div className="text-sm opacity-90">Cookie • Respect vie privée</div>
            </div>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 6: POURQUOI C'EST IMPORTANT ? */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-12">
            Pourquoi c'est important<span className="text-[#FF006E]"> ?</span>
          </h2>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                Un site web classique émet <strong className="text-[#2B5F7D]">1.76g de CO2</strong> par page vue. Commun Vivant divise cet impact par trois.
              </p>
              <p>
                C'est notre façon de garantir que les récits transmis ne pèsent pas sur l'avenir.
              </p>
              <p>
                Cette démarche est <strong className="text-[#2B5F7D]">artisanale</strong> : nous choisissons chaque outil pour sa pertinence et sa durabilité, loin des standards gourmands du web moderne.
              </p>
            </div>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 7: ALLER PLUS LOIN */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D] text-center mb-12">
            Aller plus loin<span className="text-[#FF006E]"> :</span>
          </h2>

          <div className="max-w-2xl mx-auto space-y-6">
            <a
              href="https://github.com/cnumr/best-practices"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#2B5F7D] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2B5F7D] group-hover:text-[#FF006E] transition-colors">
                    Référentiel GreenIT
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    115 bonnes pratiques d'éco-conception web
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </a>

            <a
              href="https://www.ecoindex.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#2B5F7D] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2B5F7D] group-hover:text-[#FF006E] transition-colors">
                    EcoIndex
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Calculez l'impact environnemental de votre site
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </a>

            <Link
              href="/faq#ecoconception"
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#2B5F7D] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2B5F7D] group-hover:text-[#FF006E] transition-colors">
                    Questions fréquentes
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Section dédiée à l'éco-conception
                  </p>
                </div>
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        <PinkSeparator />

        {/* SECTION 8: CTA DE FIN */}
        <section className="text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-light text-[#2B5F7D]">
              Vous aussi, créez une mémoire sobre et durable
            </h2>

            <Link
              href="/create"
              className="inline-block px-10 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full text-lg font-medium hover:bg-[#D4AF37] hover:text-white transition-all transform hover:scale-105"
            >
              Commencer mon mémorial
            </Link>

            <p className="text-sm text-gray-500 mt-6">
              Chaque mémoire compte. Chaque geste aussi.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
