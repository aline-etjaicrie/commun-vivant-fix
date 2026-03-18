'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';

export default function ExempleFeterMarie() {
  return (
    <div className="min-h-screen bg-memoir-bg">
      {/* Bouton Retour */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-xl border-2 border-memoir-blue/20 hover:shadow-2xl hover:border-memoir-neon transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-memoir-blue group-hover:text-memoir-neon group-hover:-translate-x-1 transition-all" />
          <span className="font-bold text-memoir-blue">Accueil</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden px-6 pt-32 pb-20">
          {/* Fond dégradé bleu */}
          <div className="absolute inset-0 bg-gradient-to-br from-memoir-blue via-memoir-blue/95 to-memoir-blue/90" />
          
          {/* Pattern subtil */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="relative text-center text-white space-y-8 z-10">
            <div className="inline-block bg-memoir-neon px-8 py-3 rounded-full shadow-2xl mb-6 animate-pulse">
              <span className="text-sm font-bold tracking-[0.2em] uppercase">✨ Célébration</span>
            </div>

            {/* Portrait de Marie */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8">
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&fit=crop&crop=faces"
                alt="Marie"
                fill
                className="rounded-full object-cover border-8 border-white shadow-2xl"
              />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif italic font-bold tracking-tight drop-shadow-2xl">
              Marie
            </h1>
            
            <p className="text-2xl md:text-3xl font-light">
              Parisienne, femme active, passionnée
            </p>
            
            <p className="text-xl opacity-90">
              50 ans • Paris, France
            </p>

            {/* Micro signature rose néon */}
            <div className="pt-6">
              <div className="w-20 h-1.5 bg-memoir-neon mx-auto rounded-full shadow-[0_0_30px_rgba(238,19,93,0.6)]" />
            </div>

            <div className="pt-8">
              <button className="inline-flex items-center gap-3 bg-memoir-neon text-white px-10 py-5 rounded-full text-lg font-bold shadow-[0_10px_40px_rgba(238,19,93,0.4)] hover:shadow-[0_15px_50px_rgba(238,19,93,0.6)] hover:scale-105 transition-all">
                <Heart className="w-6 h-6" />
                Ajouter un souvenir
              </button>
            </div>
          </div>
        </section>

        {/* Citation Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <blockquote className="relative text-2xl md:text-3xl font-serif italic text-memoir-blue leading-relaxed px-12 py-10 border-l-4 border-memoir-gold bg-memoir-bg/30 rounded-r-2xl">
              <div className="absolute -left-1 top-4 w-4 h-4 bg-memoir-neon rounded-full shadow-[0_0_15px_rgba(238,19,93,0.5)]" />
              « La vie, c&apos;est l&apos;art de jongler entre carrière, famille et rêves personnels, avec grâce et détermination. »
            </blockquote>
          </div>
        </section>

        {/* Son histoire */}
        <section className="py-24 px-6 bg-memoir-bg">
          <div className="max-w-5xl mx-auto space-y-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-10 relative inline-block pb-4">
                Son histoire
                <span className="absolute bottom-0 left-0 w-24 h-1.5 bg-memoir-gold rounded-full" />
              </h2>
              
              <div className="space-y-6 text-xl text-memoir-blue/90 leading-relaxed">
                <p className="bg-white p-8 rounded-2xl shadow-sm">
                  Marie incarne l&apos;élégance parisienne contemporaine. Femme active et engagée, elle a su construire une carrière brillante dans le monde de l&apos;architecture d&apos;intérieur tout en cultivant une vie de famille riche et épanouie. Née dans le 11ème arrondissement, elle a grandi entre les marchés du Marais et les cafés de Belleville, développant très tôt un œil affûté pour l&apos;esthétique urbaine.
                </p>
                <p className="bg-white p-8 rounded-2xl shadow-sm">
                  À 50 ans, Marie continue d&apos;inspirer son entourage par sa capacité à réinventer son quotidien. Entre vernissages, balades à vélo le long du Canal Saint-Martin et voyages culturels en Europe, elle cultive l&apos;art de vivre à la française avec une touche de modernité qui lui est propre.
                </p>
              </div>
            </div>

            {/* Moments de vie */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-10 relative inline-block pb-4">
                Moments de vie
                <span className="absolute bottom-0 left-0 w-24 h-1.5 bg-memoir-gold rounded-full" />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { src: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80', caption: 'Portrait professionnel, 2024' },
                  { src: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=600&q=80', caption: 'Balade dans Paris' },
                  { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', caption: 'Dans son atelier' },
                  { src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80', caption: 'En famille, été 2023' },
                  { src: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?w=600&q=80', caption: 'Rome, escapade' },
                  { src: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80', caption: 'Lecture au jardin' },
                ].map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-memoir-blue/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-base font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {photo.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ce qui la définit */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-10 relative inline-block pb-4">
                Ce qui la définit
                <span className="absolute bottom-0 left-0 w-24 h-1.5 bg-memoir-gold rounded-full" />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: '🏛️', title: 'Architecte d\'intérieur', desc: '20 ans de carrière à sublimer les espaces parisiens' },
                  { icon: '🚴‍♀️', title: 'Parisienne dans l\'âme', desc: 'Vélo, marchés bio, cafés de quartier' },
                  { icon: '🎨', title: 'Passionnée d\'art', desc: 'Vernissages, expositions et voyages culturels' },
                  { icon: '👨‍👩‍👧‍👦', title: 'Maman engagée', desc: 'Deux enfants, transmission des valeurs' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-3xl border-l-[6px] border-memoir-gold hover:border-memoir-neon hover:translate-x-2 transition-all shadow-lg hover:shadow-2xl">
                    <div className="text-5xl mb-5">{item.icon}</div>
                    <h3 className="text-2xl font-bold text-memoir-blue mb-3">{item.title}</h3>
                    <p className="text-memoir-blue/70 text-lg leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Messages */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-10 relative inline-block pb-4">
                Messages d&apos;affection
                <span className="absolute bottom-0 left-0 w-24 h-1.5 bg-memoir-gold rounded-full" />
              </h2>

              {/* Call to action */}
              <div className="bg-white p-10 rounded-3xl shadow-lg mb-12 border-2 border-memoir-neon/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-memoir-blue mb-2">
                      Partagez vos souvenirs avec Marie
                    </h3>
                    <p className="text-memoir-blue/70 text-lg">
                      Laissez un message ou envoyez un cœur pour célébrer cette journée spéciale
                    </p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <button className="inline-flex items-center gap-2 bg-memoir-neon text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      <Heart className="w-5 h-5" />
                      Envoyer un cœur
                    </button>
                    <button className="inline-flex items-center gap-2 bg-white border-2 border-memoir-blue text-memoir-blue px-8 py-4 rounded-full font-bold hover:bg-memoir-blue hover:text-white transition-all">
                      💬 Laisser un message
                    </button>
                  </div>
                </div>
              </div>

              {/* Compteur de cœurs */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg">
                  <Heart className="w-6 h-6 text-memoir-neon fill-memoir-neon" />
                  <span className="text-2xl font-bold text-memoir-blue">47 cœurs</span>
                </div>
              </div>

              {/* Messages d'exemple */}
              <div className="space-y-6">
                {[
                  {
                    author: 'Sophie L.',
                    date: 'Il y a 2 heures',
                    message: 'Joyeux anniversaire Marie ! 50 ans de créativité, d\'élégance et d\'amitié. Tu es une inspiration pour nous toutes. Merci pour tous ces moments partagés autour d\'un café à Belleville. À très vite ! 💕'
                  },
                  {
                    author: 'Thomas M.',
                    date: 'Il y a 5 heures',
                    message: 'Happy birthday ! Quelle joie de travailler avec toi depuis toutes ces années. Ton œil pour les détails et ta passion pour l\'architecture font de chaque projet une aventure unique. Longue vie à toi ! 🎨'
                  },
                  {
                    author: 'Camille & Lucas',
                    date: 'Hier',
                    message: 'Maman, on t\'aime ! Merci d\'être la femme incroyable que tu es, toujours présente, toujours inspirante. Ces 50 ans ne sont qu\'un début, on a hâte de partager les prochaines aventures avec toi. ❤️'
                  },
                  {
                    author: 'Isabelle D.',
                    date: 'Hier',
                    message: 'Marie, mon amie de toujours... Depuis le lycée, tu m\'émerveilles par ta capacité à jongler entre mille projets tout en restant toi-même. Bon anniversaire ma belle ! 🌟'
                  }
                ].map((msg, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border-l-4 border-memoir-gold">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-memoir-blue text-lg">{msg.author}</h4>
                        <p className="text-memoir-blue/50 text-sm">{msg.date}</p>
                      </div>
                      <button className="text-memoir-neon hover:scale-125 transition-transform">
                        <Heart className="w-6 h-6" />
                      </button>
                    </div>
                    <p className="text-memoir-blue/80 text-lg leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-memoir-blue text-white text-center py-16 px-6">
          <div className="space-y-5">
            <h3 className="text-3xl font-serif italic text-memoir-gold font-bold">Commun Vivant</h3>
            <p className="text-white/90 text-lg">Un espace de mémoire créé avec soin</p>
          </div>
        </footer>
      </div>
    </div>
  );
}