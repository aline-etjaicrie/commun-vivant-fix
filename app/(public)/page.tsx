
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Box, Flame, ArrowRight, CheckCircle } from 'lucide-react';
import { buildJourneyPath, CREATION_JOURNEYS } from '@/lib/journeys';

function getJourneyIcon(journeyId: string) {
  if (journeyId === 'feter') return <Sparkles className="w-7 h-7" />;
  if (journeyId === 'transmettre') return <Box className="w-7 h-7" />;
  return <Flame className="w-7 h-7" />;
}


export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">

      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-2.jpg"
            alt="Espace de mémoire partagé"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 mt-16">
          <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-lg inline-block">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Créer un espace de mémoire<span className="text-memoir-neon">.</span><br />
              Raconter une histoire<span className="text-memoir-neon">.</span><br />
              Partager vos souvenirs<span className="text-memoir-neon">.</span>
            </h1>

            <p className="text-lg md:text-xl font-serif italic text-white/90 max-w-3xl mx-auto mb-10">
              Un espace simple pour <span className="font-medium text-memoir-gold">honorer</span>, <span className="font-medium text-memoir-gold">fêter</span> ou <span className="font-medium text-memoir-gold">transmettre</span>.<br />
              En quelques minutes, vous obtenez une première version à relire et à enrichir à votre rythme<span className="text-memoir-neon">.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#portes"
                className="inline-flex items-center bg-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all transform gap-2"
              >
                Commencer une mémoire <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/exemple"
                className="inline-flex items-center bg-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/30 transition-all gap-2 border border-white/30"
              >
                Voir un exemple
              </Link>
            </div>

            <p className="mt-5 text-sm uppercase tracking-[0.25em] text-white/75">
              Première version en 5 à 10 min
            </p>
          </div>
        </div>
      </section>



      {/* SECTION 2: MANIFESTE - Version en 3 colonnes */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-memoir-blue/5">
        <div className="max-w-7xl mx-auto">
          {/* Titre centré */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic text-memoir-blue mb-6 relative inline-block">
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon rounded-full" />
              Pourquoi Commun Vivant ?
            </h2>
          </div>

          {/* Grille en 3 colonnes (responsive) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Colonne 1: Célébrer les vivants */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-stone-100">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-10 h-10 text-memoir-neon" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-memoir-blue mb-4 text-center">
                Célébrer les vivants
              </h3>
              <p className="text-lg text-memoir-blue/80 leading-relaxed text-center">
                Parce qu'il y a des personnes qu'on a envie de célébrer de leur vivant. Un anniversaire, un départ, une étape importante... Créer un espace où famille et amis déposent leurs mots, leurs photos, leurs souvenirs.
              </p>
            </div>

            {/* Colonne 2: Préserver les histoires */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-stone-100">
              <div className="flex justify-center mb-4">
                <Box className="w-10 h-10 text-memoir-gold" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-memoir-blue mb-4 text-center">
                Préserver les histoires
              </h3>
              <p className="text-lg text-memoir-blue/80 leading-relaxed text-center">
                Parce que certaines histoires ne doivent pas s'effacer avec le temps. Un objet de famille, une maison, un ancêtre... Racontez ce qui a traversé les générations.
              </p>
            </div>

            {/* Colonne 3: Dire au revoir ensemble */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-stone-100">
              <div className="flex justify-center mb-4">
                <Flame className="w-10 h-10 text-memoir-blue" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-memoir-blue mb-4 text-center">
                Dire au revoir ensemble
              </h3>
              <p className="text-lg text-memoir-blue/80 leading-relaxed text-center">
                Parce qu'on a besoin d'un lieu pour dire au revoir, ensemble. Un refuge numérique qui garde vivant ce qui ne peut pas partir.
              </p>
            </div>
          </div>

          {/* Citation finale centrée */}
          <div className="text-center mt-16">
            <p className="font-serif italic text-2xl text-memoir-gold">
              "Transmettre <span className="text-memoir-blue">ce qui compte</span> vraiment."
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES 3 PORTES - Cartes avec plus de personnalité */}
      <section id="portes" className="py-24 px-6 bg-memoir-blue/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-8">
            Quelle est votre envie ?
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-memoir-gold to-memoir-neon rounded-full mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {CREATION_JOURNEYS.map((porte, index) => {
              const borderColor = {
                gold: "border-memoir-gold hover:border-memoir-gold/80",
                neon: "border-memoir-neon hover:border-memoir-neon/80",
                blue: "border-memoir-blue hover:border-memoir-blue/80"
              }[porte.color];

              const textColor = {
                gold: "text-memoir-gold hover:bg-memoir-gold hover:text-white",
                neon: "text-memoir-neon hover:bg-memoir-neon hover:text-white",
                blue: "text-memoir-blue hover:bg-memoir-blue hover:text-white"
              }[porte.color] || "text-memoir-blue hover:bg-memoir-blue hover:text-white";

              return (
                <div
                  key={index}
                  className={`bg-white rounded-[32px] overflow-hidden shadow-lg ${borderColor} border-2 transition-all hover:shadow-xl group`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={porte.image}
                      alt={porte.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className={`absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg ${textColor.split(" ")[0]}`}>
                      {getJourneyIcon(porte.id)}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-serif italic text-memoir-blue mb-4">{porte.title}</h3>
                    <p className="text-memoir-blue/80 mb-8 leading-relaxed">{porte.homeDescription}</p>
                    <Link
                      href={buildJourneyPath(porte.id)}
                      className={`block w-full py-4 text-center border-2 font-bold rounded-xl transition-all ${textColor}`}
                    >
                      {porte.ctaLabel}
                    </Link>
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-memoir-blue/40">
                      Première version en 5 à 10 min
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* SECTION 4: APERÇU VISUEL - Miniatures cliquables */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          {/* Titre et description */}
          <div className="mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif italic text-memoir-blue">
              À quoi ressemble une mémoire <br />
              sur Commun Vivant ?
            </h2>
            <p className="text-lg text-memoir-blue/60 max-w-2xl mx-auto font-light">
              Un espace sobre, intime et pérenne pour partager photos, textes, musiques et témoignages.
            </p>
          </div>

          {/* Galerie flottante avec liens */}
          <div className="relative max-w-5xl mx-auto mb-16 h-[550px] flex items-center justify-center">
            {/* Effet de lumière d'ambiance */}
            <div className="absolute inset-0 bg-gradient-to-r from-memoir-gold/10 to-memoir-blue/10 rounded-[32px] -z-10" />

            {/* Galerie flottante */}
            <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
              {/* Miniature 1: Jean-Jacques (Transmettre) */}
              <Link
                href="/exemple/transmettre-jean-jacques"
                className="absolute left-0 w-[300px] h-[400px] bg-white rounded-[24px] shadow-xl border border-stone-100
                     transform -rotate-6 -translate-x-12 hover:rotate-0 hover:z-20 transition-all duration-500 block"
              >
                <div className="relative w-full h-full rounded-[20px] overflow-hidden p-2">
                  <Image
                    src="/jeean-marc-mini.png"
                    alt="Mémoire de Jean-Jacques - Transmettre"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-memoir-blue">
                  Jean-Jacques
                </div>
                <div className="absolute bottom-3 right-3 bg-memoir-gold/20 px-2 py-1 rounded-full text-[10px] font-medium text-memoir-blue">
                  Transmettre
                </div>
              </Link>

              {/* Miniature 2: Marie (Fêter) */}
              <Link
                href="/exemple/feter-marie"
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[450px] bg-white rounded-[24px] shadow-2xl border border-stone-100
                     z-20 hover:scale-[1.02] transition-all duration-500 block"
              >
                <div className="relative w-full h-full rounded-[20px] overflow-hidden p-2">
                  <Image
                    src="/marie-mini.png"
                    alt="Mémoire de Marie - Fêter"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-memoir-blue">
                  Marie
                </div>
                <div className="absolute bottom-3 right-3 bg-memoir-neon/20 px-2 py-1 rounded-full text-[10px] font-medium text-memoir-blue">
                  Fêter
                </div>
                {/* Badge "En ligne" */}
                <div className="absolute bottom-10 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-stone-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-memoir-blue uppercase tracking-widest">EN LIGNE</span>
                </div>
              </Link>

              {/* Miniature 3: Mina (Honorer) */}
              <Link
                href="/exemple/honorer-mina"
                className="absolute right-0 w-[300px] h-[400px] bg-white rounded-[24px] shadow-xl border border-stone-100
                     transform rotate-6 translate-x-12 hover:rotate-0 hover:z-20 transition-all duration-500 block"
              >
                <div className="relative w-full h-full rounded-[20px] overflow-hidden p-2">
                  <Image
                    src="/capture-mina.png"
                    alt="Mémoire de Mina - Honorer"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-memoir-blue">
                  Mina
                </div>
                <div className="absolute bottom-3 right-3 bg-memoir-blue/20 px-2 py-1 rounded-full text-[10px] font-medium text-white">
                  Honorer
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* SECTION 5: SUPPORTS PHYSIQUES */}
      <section className="py-24 px-6 bg-[#FDFBF7] border-t border-memoir-gold/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="relative h-[600px] w-full rounded-[40px] overflow-hidden shadow-2xl lg:order-2 group">
            <Image
              src="/image-plaque.png"
              alt="Souvenir physique"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-memoir-blue/60 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-10 left-10 text-white">
              <p className="font-serif italic text-2xl">Une trace tangible dans le réel.</p>
            </div>
          </div>

          <div className="lg:order-1 space-y-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif italic text-memoir-blue mb-6 leading-tight">
                Ancrer la mémoire <br /> <span className="text-memoir-gold">dans un support physique</span><span className="text-memoir-neon">.</span>
              </h2>
              <p className="text-lg text-memoir-blue/70 font-light leading-relaxed">
                Une fois la mémoire créée, vous pouvez l’ancrer dans un objet ou un support discret, relié à la page par une puce NFC ou un QR code.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-memoir-neon/30 transition-colors">
                <div className="p-3 bg-memoir-neon/10 rounded-xl">
                  <span className="text-2xl">🏺</span>
                </div>
                <div>
                  <h3 className="font-bold text-memoir-blue mb-1">Puce NFC pour objets</h3>
                  <p className="text-sm text-memoir-blue/60">Une pastille invisible (Ø20mm) à coller sous un objet précieux pour raconter son histoire.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-memoir-gold/30 transition-colors">
                <div className="p-3 bg-memoir-gold/10 rounded-xl">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h3 className="font-bold text-memoir-blue mb-1">Médaillon QR pour sépulture</h3>
                  <p className="text-sm text-memoir-blue/60">Un médaillon en céramique ou métal, inaltérable, pour accéder au mémorial depuis le lieu de recueillement.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/supports-physiques" className="text-memoir-neon font-bold uppercase tracking-wider text-sm hover:underline decoration-2 underline-offset-4">
                Découvrir nos supports physiques →
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 6: VOUS ÊTES UN·E PROFESSIONNEL·LE ? */}
      <section className="py-24 px-6 bg-memoir-blue">
        <div className="max-w-6xl mx-auto">

          {/* Titre */}
          <h2 className="text-4xl md:text-5xl text-white text-center mb-6 font-light">
            <span className="italic">VOUS ÊTES UN·E</span><br />
            <span className="italic">PROFESSIONNEL·LE</span> <span className="text-[#FF006E]">?</span>
          </h2>

          {/* Sous-titre */}
          <p className="text-white/90 text-center text-lg md:text-xl max-w-4xl mx-auto mb-16 leading-relaxed">
            Assureur·es, pompes funèbres, artisan·es, antiquaires, collectivités, entreprises :<br />
            nous concevons des solutions sur mesure pour enrichir votre offre et accompagner vos client·es,
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

            {/* Card 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Transmission du patrimoine immatériel des quartiers, des habitant.e.s, des métiers invisibilisés
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
              className="inline-block px-12 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full text-lg font-medium hover:bg-[#D4AF37] hover:text-memoir-blue transition-all"
            >
              Consulter l'Espace Pro
            </Link>
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-[#FDFBF7] py-20 px-6 border-t border-memoir-neon/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <h4 className="text-memoir-blue font-serif italic text-2xl font-bold">COMMUN VIVANT</h4>
          <div className="w-12 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon rounded-full shadow-[0_0_10px_rgba(238,19,93,0.4)]" />
          <p className="text-memoir-blue/60 text-lg font-light max-w-md mx-auto">
            Un outil simple pour écrire une mémoire à plusieurs,
            sans pression, sans modèle imposé.
          </p>

          <nav className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-memoir-blue/40 uppercase tracking-widest font-medium">
            <Link href="/eco-conception" className="hover:text-memoir-neon transition-colors">Engagement Durable</Link>
            <Link href="/mentions-legales" className="hover:text-memoir-gold transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-memoir-gold transition-colors">Confidentialité</Link>
            <Link href="mailto:contact@etjaicrie.fr" className="hover:text-memoir-gold transition-colors">Contact</Link>
          </nav>

          <p className="text-xs text-memoir-blue/20 pt-8">© {new Date().getFullYear()} Commun Vivant (v2.4)</p>
        </div>
      </footer>
    </div>
  );
}
