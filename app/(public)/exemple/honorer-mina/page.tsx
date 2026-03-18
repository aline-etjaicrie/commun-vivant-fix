import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';

export default function ExempleHonorerMina() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f5f0] to-[#fef8f3]">
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
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#e8d5c4] to-[#f5e6d8] px-6 py-20 md:py-24 text-center border-b-4 border-[#c9a789]">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-8">
              <Image
                src="/mina.jpg"
                alt="Mina"
                fill
                className="rounded-full object-cover border-8 border-white shadow-2xl"
                style={{ filter: 'grayscale(100%)' }}
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-light tracking-wide text-[#5a4a3a] mb-4">
              Mina
            </h1>

            <p className="text-xl md:text-2xl text-[#8a7a6a] font-light">
              1945 - 2024
            </p>

            <p className="text-2xl md:text-3xl font-serif italic text-[#6a5a4a] max-w-2xl mx-auto leading-relaxed">
              « Le sourire d'une grand-mère est le plus doux des trésors »
            </p>
          </div>
        </section>

        {/* Bougie Section */}
        <section className="bg-gradient-to-br from-[#c9a789] to-[#d4b598] py-16 px-6 text-center text-white">
          <div className="animate-pulse text-5xl mb-4">🕯️</div>
          <p className="text-xl font-light opacity-95">
            Nous gardons ta lumière dans nos cœurs
          </p>
        </section>

        {/* Content */}
        <section className="px-6 md:px-12 py-16 md:py-24 bg-white">
          {/* Bio */}
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#5a4a3a] mb-12 relative inline-block pb-6">
              Une vie de douceur
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl text-[#c9a789]">❤</span>
            </h2>

            <div className="space-y-6 text-lg text-memoir-blue/80 leading-relaxed">
              <p>
                Mina était une femme de lumière, au sourire généreux et au cœur immense. Née en Algérie en 1945, elle a construit sa vie en France tout en gardant précieusement les traditions et la chaleur de ses racines. Grand-mère de sept petits-enfants, elle a été le pilier aimant de notre famille.
              </p>
              <p>
                Sa cuisine embaumait la maison, ses bras étaient toujours ouverts, et sa sagesse guidait chacun de nous. Elle parlait peu mais écoutait beaucoup, et ses yeux bienveillants savaient réconforter sans un mot. Mina restera à jamais dans nos mémoires comme un phare de tendresse et de dignité.
              </p>
            </div>
          </div>

          {/* Qualités */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#5a4a3a] mb-12 text-center relative inline-block pb-6 w-full">
              Ce qu'elle nous a transmis
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl text-[#c9a789]">❤</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: '🤗', title: 'La générosité', desc: 'Toujours prête à partager, à accueillir, à donner sans compter' },
                { icon: '🍲', title: 'La cuisine d\'amour', desc: 'Ses couscous, ses pâtisseries, ses plats qui rassemblaient la famille' },
                { icon: '📚', title: 'La sagesse', desc: 'Ses conseils, ses histoires, sa vision apaisante de la vie' },
                { icon: '👨‍👩‍👧‍👦', title: 'L\'amour familial', desc: '7 petits-enfants chéris, des moments précieux avec chacun' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-[#fef8f3] to-[#f9f5f0] p-8 rounded-3xl border border-[#e8d5c4] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="text-5xl mb-4 text-center">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-[#5a4a3a] mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-[#7a6a5a] leading-relaxed text-center">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Galerie */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#5a4a3a] mb-12 text-center relative inline-block pb-6 w-full">
              Souvenirs en images
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl text-[#c9a789]">❤</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { src: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80', caption: 'Son sourire qui illuminait tout' },
                { src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80', caption: 'Réunion de famille, été 2022' },
                { src: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80', caption: 'Avec ses petits-enfants adorés' },
                { src: 'https://images.unsplash.com/photo-1473830394358-91588751b241?w=600&q=80', caption: 'Dans sa cuisine, son royaume' },
                { src: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80', caption: 'Moments de tendresse partagés' },
                { src: 'https://images.unsplash.com/photo-1542062177-61e9dae8a0e6?w=600&q=80', caption: 'Un de ses plus beaux portraits' },
              ].map((photo, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    className="object-cover"
                    style={{ filter: 'sepia(20%) saturate(1.1) brightness(1.05)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5a4a3a]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-medium text-center">
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Témoignages */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#5a4a3a] mb-8 text-center relative inline-block pb-6 w-full">
              Témoignages d'amour
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl text-[#c9a789]">❤</span>
            </h2>

            <p className="text-center text-[#7a6a5a] italic mb-12 text-lg">
              Ceux qui l'ont connue et aimée partagent leurs souvenirs...
            </p>

            <div className="space-y-6">
              {[
                { author: 'Sarah, sa petite-fille', message: 'Mamie, tu me manques déjà tellement. Tes câlins, tes gâteaux au miel, tes histoires du bled... Tout me rappelle toi. Tu seras toujours dans mon cœur. Je t\'aime.' },
                { author: 'Karim, son fils', message: 'Maman, tu as été la force tranquille de notre famille. Ta bienveillance, ton courage, ta dignité nous ont appris ce qu\'est l\'amour véritable. Repose en paix, nous veillerons sur ton héritage.' },
                { author: 'Leïla, sa voisine', message: 'Mina était une femme exceptionnelle. Toujours un mot gentil, toujours prête à aider. Le quartier a perdu une belle âme. Qu\'elle repose en paix.' },
                { author: 'Amine, son petit-fils', message: 'Jedda, tes histoires vont me manquer. Les mercredis chez toi, c\'était magique. Tu m\'as appris la patience, la générosité et l\'importance de la famille. Je serai toujours fier d\'être ton petit-fils.' },
              ].map((msg, idx) => (
                <div key={idx} className="bg-gradient-to-br from-[#fef8f3] to-[#f9f5f0] border-l-4 border-[#c9a789] p-6 md:p-8 rounded-xl shadow-sm">
                  <div className="font-semibold text-[#5a4a3a] mb-3">
                    {msg.author}
                  </div>
                  <p className="text-memoir-blue/70 italic leading-relaxed">
                    « {msg.message} »
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-[#5a4a3a] to-[#6a5a4a] text-white text-center py-12 px-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-[#e8d5c4]">Commun Vivant</h3>
            <p className="text-white/80 text-sm font-light">En mémoire de ceux qui restent dans nos cœurs</p>
          </div>
        </footer>
      </div>
    </div>
  );
}