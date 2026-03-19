import Link from 'next/link';
import { ArrowRight, Box, Check, CreditCard, Flame, QrCode, Sparkles, Users } from 'lucide-react';

const INDIVIDUAL_PLANS = [
  {
    title: 'Mémoire d’Objet',
    price: '49€',
    badge: 'Pour transmettre',
    icon: Box,
    description:
      'Une page dédiée à un objet précieux : son histoire, sa provenance, sa signification, les souvenirs qui l’accompagnent.',
    includes: [
      '1 page en ligne dédiée à un objet',
      'Hébergement du site',
      'QR code',
      'Ajout de texte et de photos',
      'Administration simple',
    ],
  },
  {
    title: 'Hommage Vivant',
    price: '79€',
    badge: 'Pour fêter',
    icon: Sparkles,
    description:
      'Un espace pour célébrer une personne vivante à l’occasion d’un anniversaire, d’un départ, d’un mariage, d’une étape de vie ou d’un hommage symbolique.',
    includes: [
      '1 site hommage dédié à une personne',
      'Hébergement du site',
      'QR code',
      'Participation des proches',
      'Ajout de photos, messages et souvenirs',
      'Gestion centralisée par le créateur du projet',
    ],
  },
  {
    title: 'Mémorial en Ligne',
    price: '79€',
    badge: 'Pour honorer',
    icon: Flame,
    description:
      'Un espace sobre et durable pour honorer la mémoire d’un proche disparu, rassembler les souvenirs et les transmettre.',
    includes: [
      '1 site mémorial dédié à une personne',
      'Hébergement du site',
      'QR code',
      'Participation des proches',
      'Ajout de photos, messages et souvenirs',
      'Gestion centralisée par le créateur du projet',
    ],
  },
];

const FAMILY_PACKS = [
  {
    title: 'Pack Transmission',
    price: '149€',
    subtitle: '1 personne + 5 objets',
    description:
      'Pour relier la mémoire d’une personne à plusieurs objets de transmission dans un même ensemble cohérent.',
    includes: ['1 espace dédié à une personne', '5 pages objets', 'Hébergement', 'QR code', 'Gestion centralisée'],
  },
  {
    title: 'Pack Transmission Étendu',
    price: '199€',
    subtitle: '1 personne + 10 objets',
    description:
      'Pour les familles qui souhaitent conserver un patrimoine plus large, avec davantage d’objets, de souvenirs et de récits.',
    includes: ['1 espace dédié à une personne', '10 pages objets', 'Hébergement', 'QR code', 'Gestion centralisée'],
  },
];

const OBJECT_SCALE = [
  { count: '1 objet', price: '49€' },
  { count: '3 objets', price: '119€' },
  { count: '5 objets', price: '179€' },
  { count: '10 objets', price: '299€' },
];

const INCLUDED = [
  'Création d’un espace en ligne',
  'Hébergement du site',
  'QR code',
  'Interface d’administration',
  'Mise en ligne simple',
  'Rendu élégant, accessible et partageable',
];

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7A5A2E]">
            <CreditCard className="h-4 w-4" />
            Tarifs
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-serif text-[#0F2A44]">
            Chaque mémoire mérite une forme juste.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#405466]">
            Nos formules ont été pensées pour transmettre l’histoire d’un objet, célébrer une personne vivante
            ou honorer un proche disparu, dans un espace en ligne beau, simple et durable.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#5E6B78]">
            Chaque formule inclut la création d’un espace en ligne hébergé par nos soins, pensé pour
            transmettre, célébrer ou honorer une mémoire avec simplicité et élégance.
          </p>
        </section>

        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif text-[#0F2A44]">Formules individuelles</h2>
              <p className="mt-2 text-[#5E6B78]">Trois manières de créer un espace juste, selon l’intention de départ.</p>
            </div>
            <Link href="/create" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[#0F2A44] hover:text-[#D4AF37]">
              Commencer un projet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {INDIVIDUAL_PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <article key={plan.title} className="rounded-[28px] border border-[#E7E1D7] bg-white p-8 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F2E8] text-[#C9A24D]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-medium text-[#7A5A2E]">
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-serif text-[#0F2A44]">{plan.title}</h3>
                      <p className="mt-1 text-4xl font-serif text-[#0F2A44]">{plan.price}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#5E6B78]">{plan.description}</p>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7A5A2E]">Inclus</p>
                    <ul className="mt-4 space-y-3">
                      {plan.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-[#405466]">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF6F0] text-[#2F6F45]">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[32px] border border-[#E7E1D7] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F7] text-[#2B5F7D]">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-[#0F2A44]">Packs famille</h2>
                <p className="mt-1 text-sm text-[#5E6B78]">Pour relier une mémoire humaine et plusieurs objets de transmission.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {FAMILY_PACKS.map((pack) => (
                <article key={pack.title} className="rounded-[24px] border border-[#ECE7DE] bg-[#FCFBF8] p-6">
                  <p className="text-sm font-medium text-[#7A5A2E]">{pack.subtitle}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-2xl font-serif text-[#0F2A44]">{pack.title}</h3>
                    <span className="text-3xl font-serif text-[#0F2A44]">{pack.price}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5E6B78]">{pack.description}</p>
                  <ul className="mt-5 space-y-2">
                    {pack.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[#405466]">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#2F6F45]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E7E1D7] bg-[#0F2A44] p-8 text-white shadow-sm">
            <h2 className="text-3xl font-serif">Tarifs dégressifs — Objets</h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Pour les projets centrés sur plusieurs objets, les tarifs deviennent plus avantageux à mesure que la collection grandit.
            </p>

            <div className="mt-8 space-y-3">
              {OBJECT_SCALE.map((row) => (
                <div key={row.count} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <span className="text-sm font-medium text-white/80">{row.count}</span>
                  <span className="text-2xl font-serif">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[32px] border border-[#E7E1D7] bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-serif text-[#0F2A44]">Ce qui est inclus dans chaque formule</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {INCLUDED.map((item) => (
                <div key={item} className="rounded-2xl border border-[#ECE7DE] bg-[#FCFBF8] px-4 py-4 text-sm text-[#405466]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF6F0] text-[#2F6F45]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-[#E7E1D7] bg-[#F7F4EF] p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#C9A24D]">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-2xl font-serif text-[#0F2A44]">QR inclus</h3>
            <p className="mt-3 text-sm leading-7 text-[#5E6B78]">
              Le QR code est inclus dans les formules. Si une puce NFC fait partie d’une offre ou d’une option, cela doit être précisé séparément.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#5E6B78]">
              Nous évitons toute ambiguïté entre QR inclus et NFC incluse ou proposée en option.
            </p>
          </aside>
        </section>

        <section className="mt-20 rounded-[36px] border border-[#E7E1D7] bg-white px-8 py-10 shadow-sm md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-serif text-[#0F2A44]">Voir les réponses les plus fréquentes</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5E6B78]">
                Hébergement, participation des proches, version gratuite, QR code, NFC, fonctionnement du service :
                tout est détaillé dans notre FAQ.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/faq" className="inline-flex items-center gap-2 rounded-full border border-[#0F2A44] px-5 py-3 text-sm font-medium text-[#0F2A44] hover:border-[#D4AF37] hover:text-[#D4AF37]">
                Voir la FAQ
              </Link>
              <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-[#0F2A44] px-5 py-3 text-sm font-medium text-white hover:bg-[#173754]">
                Commencer un projet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
