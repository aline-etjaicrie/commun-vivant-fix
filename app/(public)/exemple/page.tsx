import Link from 'next/link';
import Image from 'next/image';

export default function ExemplePage() {
  return (
    <div className="py-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto text-center">
        {/* Titre de la page */}
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif italic text-memoir-blue">
            Découvrez nos exemples <br />
            de mémoires
          </h1>
          <p className="text-lg text-memoir-blue/60 max-w-3xl mx-auto font-light">
            Explorez nos trois types de mémoires : pour fêter, transmettre ou honorer.
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16 max-w-4xl mx-auto text-left">
          <p className="text-lg text-memoir-blue/80 leading-relaxed">
            Chaque mémoire sur Commun Vivant est un espace unique, conçu pour célébrer, transmettre ou honorer ce qui compte pour vous.
            Voici trois exemples pour vous inspirer.
          </p>
        </div>

        {/* Galerie des exemples */}
        <div className="space-y-16">
          {/* Exemple 1: Jean-Jacques (Transmettre) */}
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <Link
                  href="/exemple/transmettre-jean-jacques"
                  className="block bg-white rounded-[24px] shadow-xl border border-stone-100 overflow-hidden transform hover:scale-[1.01] transition-all duration-500"
                >
                  <div className="relative w-full h-[300px] rounded-[20px] overflow-hidden">
                    <Image
                      src="/jeean-marc-mini.png"
                      alt="Mémoire de Jean-Jacques - Transmettre"
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
              <div className="w-full md:w-1/2 text-left space-y-4">
                <h2 className="text-2xl font-serif italic text-memoir-blue">Transmettre</h2>
                <p className="text-lg text-memoir-blue/80 leading-relaxed">
                  Un espace pour raconter l'histoire d'un objet, d'une maison, ou d'un patrimoine familial.
                  Jean-Jacques a choisi de transmettre ses souvenirs liés à sa collection de vinyles.
                </p>
                <Link
                  href="/exemple/transmettre-jean-jacques"
                  className="inline-flex items-center px-8 py-3 border border-memoir-gold text-memoir-gold rounded-full font-medium hover:bg-memoir-gold hover:text-white transition-all gap-2"
                >
                  Voir l'exemple
                </Link>
              </div>
            </div>
          </div>

          {/* Exemple 2: Marie (Fêter) */}
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 order-2 md:order-1 text-left space-y-4">
                <h2 className="text-2xl font-serif italic text-memoir-blue">Fêter</h2>
                <p className="text-lg text-memoir-blue/80 leading-relaxed">
                  Un espace pour célébrer une personne de son vivant, pour un anniversaire, un départ à la retraite, ou une étape importante.
                  Marie a créé une mémoire pour son 60ème anniversaire, où ses proches ont partagé leurs souvenirs.
                </p>
                <Link
                  href="/exemple/feter-marie"
                  className="inline-flex items-center px-8 py-3 border border-memoir-neon text-memoir-neon rounded-full font-medium hover:bg-memoir-neon hover:text-white transition-all gap-2"
                >
                  Voir l'exemple
                </Link>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <Link
                  href="/exemple/feter-marie"
                  className="block bg-white rounded-[24px] shadow-xl border border-stone-100 overflow-hidden transform hover:scale-[1.01] transition-all duration-500"
                >
                  <div className="relative w-full h-[300px] rounded-[20px] overflow-hidden">
                    <Image
                      src="/marie-mini.png"
                      alt="Mémoire de Marie - Fêter"
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Exemple 3: Mina (Honorer) */}
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <Link
                  href="/exemple/honorer-mina"
                  className="block bg-white rounded-[24px] shadow-xl border border-stone-100 overflow-hidden transform hover:scale-[1.01] transition-all duration-500"
                >
                  <div className="relative w-full h-[300px] rounded-[20px] overflow-hidden">
                    <Image
                      src="/capture-mina.png"
                      alt="Mémoire de Mina - Honorer"
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
              <div className="w-full md:w-1/2 text-left space-y-4">
                <h2 className="text-2xl font-serif italic text-memoir-blue">Honorer</h2>
                <p className="text-lg text-memoir-blue/80 leading-relaxed">
                  Un espace pour honorer la mémoire d'une personne disparue avec dignité et pudeur.
                  La famille de Mina a créé cette mémoire pour garder ses souvenirs vivants.
                </p>
                <Link
                  href="/exemple/honorer-mina"
                  className="inline-flex items-center px-8 py-3 border border-memoir-blue text-memoir-blue rounded-full font-medium hover:bg-memoir-blue hover:text-white transition-all gap-2"
                >
                  Voir l'exemple
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton pour revenir à l'accueil */}
        <div className="mt-20">
          <Link
            href="/"
            className="inline-flex items-center px-10 py-5 border border-memoir-blue/20 rounded-full text-memoir-blue font-medium
                        hover:bg-memoir-blue hover:text-white hover:border-memoir-blue transition-all gap-2"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
