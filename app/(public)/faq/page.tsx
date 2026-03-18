'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Mail, ChevronDown, ChevronUp, Sparkles, Brain, CreditCard } from 'lucide-react';

const FAQ_DATA = [
  {
    category: "Général",
    icon: <Sparkles className="w-6 h-6" />,
    color: "gold",
    questions: [
      {
        q: "Qu'est-ce que Commun Vivant ?",
        a: `<p>Commun Vivant est une plateforme pour créer des <strong>espaces de mémoire numériques</strong>, conçus pour :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Fêter</strong> : un anniversaire, une retraite, une étape de vie (avec messages de soutien et galerie collaborative).</li>
              <li><strong>Transmettre</strong> : l’histoire d’un objet, d’une maison ou d’un patrimoine familial (idéal pour les héritages).</li>
              <li><strong>Honorer</strong> : la mémoire d’un proche disparu (avec bougies virtuelles et livre d’or).</li>
            </ul>
            <p class="mt-2">Votre mémoire est accessible via une <strong>page web unique</strong> et un support physique (QR code ou puce NFC).</p>`
      },
      {
        q: "Quelle est la différence entre Fêter, Transmettre et Honorer ?",
        a: `<div class="space-y-3">
              <div>
                <p class="font-medium">🎉 Fêter :</p>
                <p>Pour célébrer une personne <strong>vivante</strong> (anniversaire, retraite, hommage). Inclut des cœurs de soutien, des messages d’encouragement, et une galerie collaborative.</p>
              </div>
              <div>
                <p class="font-medium">📦 Transmettre :</p>
                <p>Pour raconter l’histoire d’un <strong>objet</strong> (meuble, bijou, maison) ou d’un patrimoine familial. Parfait pour accompagner un cadeau ou une transmission.</p>
              </div>
              <div>
                <p class="font-medium">✨ Honorer :</p>
                <p>Pour créer un <strong>mémorial</strong> pour une personne disparue. Inclut des bougies virtuelles, un livre d’or, et des messages d’hommage.</p>
              </div>
            </div>`
      },
      {
        q: "Combien de temps dure l'hébergement ?",
        a: `<p><strong>5 ans inclus</strong> dans tous nos tarifs. Vous recevrez un email 6 mois avant l’expiration pour renouveler (à partir de 25€/5 ans).</p>
            <p class="mt-2">Options d’extension :</p>
            <ul class="list-disc pl-6 mt-1 space-y-1">
              <li>+5 ans : +25€</li>
              <li>À vie (30 ans) : +90€</li>
            </ul>`
      },
      {
        q: "Est-ce vraiment sans abonnement ?",
        a: `<p>✅ <strong>Oui, aucun abonnement</strong>. Vous payez une fois, et votre mémoire reste en ligne pendant la durée choisie (5 ans minimum).</p>
            <p class="mt-2">🚫 <strong>Aucun frais caché</strong>, aucun renouvellement automatique.</p>`
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: `<p>Oui, vos données sont protégées :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>Hébergement <strong>RGPD compliant</strong> en Europe.</li>
              <li>Vous êtes <strong>propriétaire</strong> de votre contenu.</li>
              <li>Modification/suppression possible à tout moment.</li>
              <li>Aucune revente de données à des tiers.</li>
            </ul>
            <p class="mt-2">🔒 <strong>Droit à l’oubli garanti</strong> : suppression définitive sur demande.</p>`
      },
      {
        q: "Puis-je créer plusieurs mémoires avec le même compte ?",
        a: `<p>Oui ! Depuis votre <Link href="/dashboard" class="text-[#D4AF37] hover:underline">tableau de bord</Link>, vous pouvez créer autant de mémoires que vous le souhaitez. Chacune est facturée séparément, ou vous pouvez opter pour un <strong>pack famille</strong> (ex: 1 personne + 10 objets pour 199€).</p>`
      }
    ]
  },
  {
    category: "IA & Alma",
    icon: <Brain className="w-6 h-6" />,
    color: "neon",
    questions: [
      {
        q: "Comment fonctionne Alma, votre assistante IA ?",
        a: `<p>Alma vous guide via un <strong>questionnaire structuré</strong> (11 étapes pour les personnes, simplifié pour les objets). Elle génère ensuite un texte biographique dans le style que vous choisissez :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Sobre</strong> : factuel et épuré.</li>
              <li><strong>Narratif</strong> : chaleureux et humain.</li>
              <li><strong>Poétique</strong> : sensible et littéraire.</li>
            </ul>
            <p class="mt-2">Vous pouvez <strong>relire, modifier ou demander des ajustements</strong> avant publication.</p>`
      },
      {
        q: "L'IA invente-t-elle des informations ?",
        a: `<p>❌ <strong>Non, jamais</strong>. Alma respecte strictement les faits que vous fournissez. Elle ne brode pas, n’invente pas de détails, et respecte vos silences. Si une information n’est pas renseignée, elle n’apparaîtra pas dans le récit.</p>`
      },
      {
        q: "Puis-je écrire moi-même le texte sans utiliser l'IA ?",
        a: `<p>Oui ! Lors de la création, choisissez l’option <strong>"Écriture libre"</strong> pour rédiger votre texte vous-même, sans passer par le questionnaire guidé.</p>`
      },
      {
        q: "Puis-je modifier le texte après génération ?",
        a: `<p>Oui, vous avez le contrôle total :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>Relire et demander des ajustements.</li>
              <li>Modifier manuellement le texte.</li>
              <li>Demander une nouvelle génération (jusqu’à 3 fois).</li>
            </ul>
            <p class="mt-2">💡 Vous validez le texte final avant publication.</p>`
      }
    ]
  },
  {
    category: "Tarifs",
    icon: <CreditCard className="w-6 h-6" />,
    color: "blue",
    questions: [
      {
        q: "Quels sont vos tarifs ?",
        a: `<div class="space-y-3">
              <div>
                <p class="font-medium">Formules individuelles :</p>
                <ul class="list-disc pl-6 mt-1 space-y-1">
                  <li>Mémoire d’Objet : <strong>49€</strong> (Transmettre)</li>
                  <li>Hommage Vivant : <strong>79€</strong> (Fêter)</li>
                  <li>Mémorial en Ligne : <strong>79€</strong> (Honorer)</li>
                </ul>
              </div>
              <div>
                <p class="font-medium">Packs famille :</p>
                <ul class="list-disc pl-6 mt-1 space-y-1">
                  <li>Pack Transmission : <strong>149€</strong> (1 Personne + 5 Objets)</li>
                  <li>Pack Transmission Étendu : <strong>199€</strong> (1 Personne + 10 Objets)</li>
                </ul>
              </div>
              <div>
                <p class="font-medium">Tarifs dégressifs (objets) :</p>
                <ul class="list-disc pl-6 mt-1 space-y-1">
                  <li>1 objet : 49€</li>
                  <li>3 objets : 119€ (<strong>-19%</strong>)</li>
                  <li>5 objets : 179€ (<strong>-27%</strong>)</li>
                  <li>10 objets : 299€ (<strong>-39%</strong>)</li>
                </ul>
              </div>
            </div>`
      },
      {
        q: "Pourquoi les objets sont-ils moins chers que les personnes ?",
        a: `<p>Les mémoires d’objets sont <strong>plus simples</strong> :</p>
            <ul class="list-disc pl-6 mt-2 space-y-1">
              <li>Questionnaire raccourci (moins d’étapes).</li>
              <li>Moins de photos/médias à gérer.</li>
              <li>Pas de fonctionnalités avancées (ex: bougies virtuelles).</li>
            </ul>
            <p class="mt-2">Elles sont conçues comme une <strong>porte d’entrée accessible</strong> pour découvrir Commun Vivant.</p>`
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const filteredFAQ = useMemo(() => {
    if (!searchQuery) return FAQ_DATA;
    const lowerQuery = searchQuery.toLowerCase();
    return FAQ_DATA.map(category => ({
      ...category,
      questions: category.questions.filter(q =>
        q.q.toLowerCase().includes(lowerQuery) ||
        q.a.toLowerCase().includes(lowerQuery)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchQuery]);

  const toggleQuestion = (question: string) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(question)) {
      newOpen.delete(question);
    } else {
      newOpen.add(question);
    }
    setOpenQuestions(newOpen);
  };

  const categoryColors = {
    gold: "text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5",
    neon: "text-[#EE135D] border-[#EE135D]/20 bg-[#EE135D]/5",
    blue: "text-[#2B5F7D] border-[#2B5F7D]/20 bg-[#2B5F7D]/5"
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      <main className="pt-32 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Titre et introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2B5F7D] mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-[#2B5F7D]/70 text-lg max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Commun Vivant, nos mémoires et nos services.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une réponse (ex: tarifs, sécurité, IA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-[#D4AF37]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-[#2B5F7D] placeholder-[#2B5F7D]/40 shadow-sm"
          />
        </div>

        {/* Liste des FAQ */}
        <div className="space-y-10">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((category, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 md:p-8 shadow-sm border ${categoryColors[category.color as keyof typeof categoryColors]}`}
              >
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-[#2B5F7D]/10">
                  <div className={`${category.color === 'gold' ? 'text-memoir-gold' : category.color === 'neon' ? 'text-memoir-neon' : 'text-memoir-blue'}`}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-serif text-[#2B5F7D]">
                    {category.category}
                  </h2>
                </div>
                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <div key={qIdx} className="border-b border-[#2B5F7D]/5 pb-4 last:border-0 last:pb-0">
                      <button
                        onClick={() => toggleQuestion(item.q)}
                        className="w-full text-left flex items-start justify-between group py-2"
                      >
                        <span className="font-medium text-[#2B5F7D] text-lg group-hover:text-[#D4AF37] transition-colors">
                          {item.q}
                        </span>
                        {openQuestions.has(item.q) ? (
                          <ChevronUp className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#2B5F7D]/40 group-hover:text-[#D4AF37] flex-shrink-0 mt-1" />
                        )}
                      </button>
                      {openQuestions.has(item.q) && (
                        <div
                          className="mt-3 text-[#2B5F7D]/80 leading-relaxed pl-1 prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.a }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-[#2B5F7D]/60">Aucun résultat trouvé pour "{searchQuery}"</p>
              <p className="mt-2 text-sm">
                Essayez avec des mots-clés comme "tarifs", "sécurité", "IA", ou <button onClick={() => setSearchQuery('')} className="text-[#D4AF37] hover:underline">voir toutes les questions</button>.
              </p>
            </div>
          )}
        </div>

        {/* CTA Contact */}
        <div className="mt-16 text-center bg-[#2B5F7D] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h3 className="text-2xl font-serif mb-4">Une question sans réponse ?</h3>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Notre équipe est à votre écoute pour vous accompagner dans la création de vos mémoires.
            </p>
            <Link
              href="mailto:bonjour@communvivant.com"
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b39025] text-white px-8 py-3 rounded-full transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              Nous écrire
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
