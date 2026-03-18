import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ExempleTransmettreJeanJacques() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {/* Bouton Retour */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-memoir-blue/10 hover:shadow-xl transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-memoir-blue group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-memoir-blue">Accueil</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-br from-memoir-blue to-memoir-blue/90 text-white px-6 md:px-12 py-12 md:py-16 border-b-4 border-memoir-gold">
          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-memoir-gold mb-4">
              Patrimoine Familial
            </div>
            <h1 className="text-4xl md:text-6xl font-serif italic font-bold mb-4 tracking-tight">
              Le secrétaire de Jean-Jacques
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Un meuble témoin de quatre générations
            </p>
          </div>
        </header>

        {/* Hero Image */}
        <section className="relative h-[50vh] md:h-[60vh] bg-[#e8e6e1]">
          <Image
            src="/meuble.jpg"
            alt="Secrétaire ancien"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-memoir-blue/90 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 text-center py-8 px-6">
            <p className="text-white text-2xl md:text-3xl font-serif italic max-w-3xl mx-auto leading-relaxed">
              « Les meubles portent en eux la mémoire des gestes et des silences de ceux qui les ont habités. »
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 md:px-12 py-16 md:py-24 bg-[#fdfbf7]">
          {/* Citation intro */}
          <div className="max-w-4xl mx-auto mb-20">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-memoir-blue text-center leading-relaxed py-8 border-t-2 border-b-2 border-memoir-gold">
              Ce secrétaire en noyer massif du XIXe siècle a traversé quatre générations de notre famille, témoin silencieux de nos joies, de nos peines et de notre histoire.
            </blockquote>
          </div>

          {/* Histoire du meuble */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-serif italic text-memoir-blue text-center mb-12 relative pb-4">
              L'histoire du meuble
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-memoir-gold rounded-full" />
            </h2>

            <div className="space-y-8 text-lg text-memoir-blue/80 leading-loose text-justify">
              <p className="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-memoir-gold first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]">
                Ce secrétaire fut acquis en 1887 par mon arrière-grand-père, notaire à Lyon. Pièce maîtresse de son étude, ce meuble en noyer massif a vu défiler des centaines d'actes, de contrats et de testaments. Ses tiroirs secrets ont gardé les confidences de plusieurs générations de bourgeois lyonnais.
              </p>
              <p>
                À la retraite de mon arrière-grand-père en 1920, le secrétaire fut transporté dans la demeure familiale de Beaune. Mon grand-père, Jean-Jacques, en fit son refuge. C'est là qu'il écrivait ses lettres, tenait ses comptes et rédigeait son journal intime. Les traces de son encre bleue marquent encore le buvard de cuir.
              </p>
              <p>
                Après la guerre, le meuble suivit la famille à Paris. Mon père y rangea ses premiers dessins d'architecte. Aujourd'hui, il trône dans mon salon, symbole vivant de la continuité familiale. Ses tiroirs recèlent encore des photos jaunies, des lettres d'amour et des souvenirs de voyages oubliés.
              </p>
            </div>
          </div>

          {/* Galerie patrimoine */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-serif italic text-memoir-blue text-center mb-12 relative pb-4">
              Mémoire photographique
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-memoir-gold rounded-full" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { src: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80', caption: 'Le secrétaire dans toute sa splendeur, 2024' },
                { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', caption: 'Jean-Jacques devant son secrétaire, 1955' },
                { src: 'https://images.unsplash.com/photo-1531435610747-2e8ac9d06fe5?w=600&q=80', caption: 'Réunion familiale, années 1960' },
                { src: 'https://images.unsplash.com/photo-1606787364819-5f3b0e7a7a7f?w=600&q=80', caption: 'Les détails de marqueterie' },
                { src: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80', caption: 'Portrait de famille, 1920' },
                { src: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600&q=80', caption: 'Correspondances familiales' },
              ].map((photo, idx) => (
                <div key={idx} className="bg-white p-4 border border-[#d4d0c8] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[4/3] mb-4">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover"
                      style={{ filter: 'sepia(40%) brightness(1.1)' }}
                    />
                  </div>
                  <p className="text-center text-memoir-blue font-serif italic text-sm">
                    {photo.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif italic text-memoir-blue text-center mb-12 relative pb-4">
              Chronologie familiale
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-memoir-gold rounded-full" />
            </h2>

            <div className="relative pl-8 md:pl-12 space-y-10">
              {/* Timeline line */}
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-memoir-gold" />

              {[
                { year: '1887', text: 'Acquisition du secrétaire par l\'arrière-grand-père, notaire à Lyon. Premier propriétaire d\'une longue lignée.' },
                { year: '1920', text: 'Le meuble rejoint la propriété familiale de Beaune. Jean-Jacques, alors jeune homme, en fait son espace personnel.' },
                { year: '1955', text: 'Jean-Jacques, devenu chef de famille, y rédige ses mémoires et gère les affaires familiales depuis ce bureau.' },
                { year: '1978', text: 'Déménagement à Paris. Le secrétaire traverse la France et s\'installe dans l\'appartement haussmannien de la famille.' },
                { year: '2024', text: 'Restauration complète respectueuse de son histoire. Le meuble continue d\'accueillir les souvenirs de famille.' },
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.75rem] top-1 w-3 h-3 rounded-full bg-memoir-gold border-4 border-[#fdfbf7] shadow-[0_0_0_2px] shadow-memoir-gold" />
                  
                  <div className="text-2xl font-serif font-bold text-memoir-blue mb-2">
                    {item.year}
                  </div>
                  <p className="text-memoir-blue/70 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-memoir-blue text-white text-center py-12 px-6 border-t-4 border-memoir-gold">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif italic text-memoir-gold">Commun Vivant</h3>
            <p className="text-white/80 text-sm font-serif italic">Transmettre ce qui compte vraiment</p>
          </div>
        </footer>
      </div>
    </div>
  );
}