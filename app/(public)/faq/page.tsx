'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Search, Server, Sparkles, Users } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Tarifs & formules',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'gold',
    questions: [
      {
        q: 'Quels sont vos tarifs ?',
        a: `<p>Nous proposons plusieurs formules selon le type de mémoire que vous souhaitez créer :</p>
            <p class="mt-3 font-medium">Formules individuelles</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>Mémoire d’Objet : <strong>49€</strong></li>
              <li>Hommage Vivant : <strong>79€</strong></li>
              <li>Mémorial en Ligne : <strong>79€</strong></li>
            </ul>
            <p class="mt-3 font-medium">Packs famille</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>Pack Transmission : <strong>149€</strong> — 1 personne + 5 objets</li>
              <li>Pack Transmission Étendu : <strong>199€</strong> — 1 personne + 10 objets</li>
            </ul>
            <p class="mt-3 font-medium">Tarifs dégressifs pour les objets</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>1 objet : 49€</li>
              <li>3 objets : 119€</li>
              <li>5 objets : 179€</li>
              <li>10 objets : 299€</li>
            </ul>`
      },
      {
        q: 'Pourquoi les objets sont-ils moins chers que les personnes ?',
        a: `<p>Parce qu’un objet et une personne ne demandent pas le même niveau de narration, de sensibilité ni de structuration.</p>
            <p class="mt-3">Un projet centré sur une personne implique généralement :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>davantage de contenu ;</li>
              <li>une mise en récit plus riche ;</li>
              <li>plus de personnalisation ;</li>
              <li>davantage de participation des proches ;</li>
              <li>une portée émotionnelle plus forte.</li>
            </ul>
            <p class="mt-3">Un objet, lui, s’inscrit souvent dans un format plus simple et plus ciblé. C’est pourquoi les formules “objet” sont proposées à un tarif plus léger.</p>`
      },
      {
        q: 'Est-ce qu’il y a une version gratuite ?',
        a: `<p><strong>Non.</strong> La création d’un vrai projet est payante.</p>
            <p class="mt-3">En revanche, vous pouvez découvrir l’univers, consulter des exemples et comprendre le fonctionnement avant de vous engager.</p>`
      },
    ],
  },
  {
    category: 'Création & participation',
    icon: <Users className="w-6 h-6" />,
    color: 'neon',
    questions: [
      {
        q: 'Peut-on inviter d’autres personnes à participer ?',
        a: `<p>Oui. Pour les formules dédiées aux personnes, les proches peuvent contribuer en ajoutant des messages, des souvenirs ou des photos.</p>
            <p class="mt-3">Le projet reste piloté par une personne principale, qui garde la main sur l’organisation et la mise en ligne.</p>`
      },
      {
        q: 'Puis-je créer un projet pour un anniversaire ou un hommage collectif ?',
        a: `<p>Oui. La formule <strong>Hommage Vivant</strong> est pensée pour cela : anniversaire, départ, mariage, événement marquant, hommage symbolique ou message collectif.</p>`
      },
      {
        q: 'Puis-je créer un mémorial pour une personne disparue ?',
        a: `<p>Oui. La formule <strong>Mémorial en Ligne</strong> est conçue pour honorer un proche disparu dans un espace sobre, accessible et durable.</p>`
      },
      {
        q: 'Puis-je voir un exemple avant de payer ?',
        a: `<p>Oui. Vous pouvez consulter des exemples et découvrir l’univers du service avant de créer un vrai projet.</p>
            <p class="mt-3">Nous faisons une distinction claire entre la découverte gratuite et la création réelle, qui elle est payante.</p>`
      },
      {
        q: 'Qu’est-ce qui est inclus dans chaque formule ?',
        a: `<ul class="list-disc pl-6 space-y-1">
              <li>création d’un espace en ligne ;</li>
              <li>hébergement du site ;</li>
              <li>QR code ;</li>
              <li>interface d’administration ;</li>
              <li>mise en ligne simple ;</li>
              <li>rendu élégant, accessible et partageable.</li>
            </ul>`
      },
    ],
  },
  {
    category: 'Hébergement & accès',
    icon: <Server className="w-6 h-6" />,
    color: 'blue',
    questions: [
      {
        q: 'Le QR code est-il inclus ?',
        a: `<p>Oui, le QR code est inclus dans les formules.</p>`
      },
      {
        q: 'La puce NFC est-elle incluse ?',
        a: `<p>Si la puce NFC fait partie d’une offre ou d’une option, cela doit être précisé clairement dans le détail de la formule ou au moment de la commande.</p>
            <p class="mt-3">Nous évitons toute ambiguïté entre QR inclus et NFC incluse ou proposée en option.</p>`
      },
      {
        q: 'Où sont hébergés les sites ?',
        a: `<p>Les sites sont hébergés par nos soins, afin de garantir une expérience simple, cohérente et prête à l’emploi.</p>`
      },
      {
        q: 'Puis-je récupérer le site pour l’héberger ailleurs ?',
        a: `<p>Le service repose sur une création hébergée et administrée par nos soins.</p>
            <p class="mt-3">L’objectif est de vous offrir une solution simple, stable et directement utilisable, sans configuration technique à gérer.</p>`
      },
      {
        q: 'Pourquoi le service est-il payant ?',
        a: `<p>Le paiement couvre la création du site, son hébergement, le QR code, l’orchestration des contributions et la mise en ligne.</p>
            <p class="mt-3">Commun Vivant n’est pas un simple outil pour faire une page : c’est un service sensible, hébergé et prêt à l’emploi.</p>`
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const filteredFAQ = useMemo(() => {
    if (!searchQuery) return FAQ_DATA;
    const lowerQuery = searchQuery.toLowerCase();
    return FAQ_DATA.map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(lowerQuery) ||
          item.a.toLowerCase().includes(lowerQuery)
      ),
    })).filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  const toggleQuestion = (question: string) => {
    const next = new Set(openQuestions);
    if (next.has(question)) {
      next.delete(question);
    } else {
      next.add(question);
    }
    setOpenQuestions(next);
  };

  const categoryColors = {
    gold: 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5',
    neon: 'text-[#EE135D] border-[#EE135D]/20 bg-[#EE135D]/5',
    blue: 'text-[#2B5F7D] border-[#2B5F7D]/20 bg-[#2B5F7D]/5',
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7A5A2E]">
            <Sparkles className="w-4 h-4" />
            FAQ
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-serif text-[#2B5F7D]">
            Questions fréquentes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#2B5F7D]/70">
            Tarifs, participation, QR code, hébergement, fonctionnement du service : l’essentiel est ici.
          </p>
        </div>

        <div className="relative mb-12 mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une réponse : tarifs, QR code, participation..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-full border border-[#D4AF37]/20 bg-white py-4 pl-12 pr-4 text-[#2B5F7D] placeholder-[#2B5F7D]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          />
        </div>

        <div className="space-y-10">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((category, index) => (
              <section
                key={index}
                className={`rounded-2xl border p-6 shadow-sm md:p-8 ${categoryColors[category.color as keyof typeof categoryColors]}`}
              >
                <div className="mb-6 flex items-center gap-3 border-b border-[#2B5F7D]/10 pb-4">
                  <div className={category.color === 'gold' ? 'text-memoir-gold' : category.color === 'neon' ? 'text-memoir-neon' : 'text-memoir-blue'}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-serif text-[#2B5F7D]">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-[#2B5F7D]/5 pb-4 last:border-0 last:pb-0">
                      <button
                        onClick={() => toggleQuestion(item.q)}
                        className="group flex w-full items-start justify-between py-2 text-left"
                      >
                        <span className="text-lg font-medium text-[#2B5F7D] transition-colors group-hover:text-[#D4AF37]">
                          {item.q}
                        </span>
                        {openQuestions.has(item.q) ? (
                          <ChevronUp className="mt-1 h-5 w-5 flex-shrink-0 text-[#D4AF37]" />
                        ) : (
                          <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-[#2B5F7D]/40 transition-colors group-hover:text-[#D4AF37]" />
                        )}
                      </button>

                      {openQuestions.has(item.q) && (
                        <div
                          className="prose mt-3 max-w-none pl-1 leading-relaxed text-[#2B5F7D]/80"
                          dangerouslySetInnerHTML={{ __html: item.a }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-[#2B5F7D]/60">Aucun résultat trouvé pour “{searchQuery}”.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
