import Image from "next/image"
import Link from "next/link"
import { FooterLegal } from "@/components/FooterLegal"


function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ")
}

/** Tiny inline icon set (no deps) */
function IconSparkle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.6 2.4L22 16l-2.4.6L19 19l-.6-2.4L16 16l2.4-.6L19 13z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconClipboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 4h6m-6 0a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-6 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 10h6M9 14h6M9 18h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      {children}
    </span>
  )
}

function GoldDot() {
  return <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-memoir-gold/90" />
}

/**
 * FlipCard: hover (desktop) + focus (keyboard) + tap (mobile) friendly
 * - Uses <details> for click/tap toggle + group hover for desktop polish
 */
function FlipCard({
  icon,
  title,
  badge,
  intro,
  bullets,
  ctaHref,
  ctaLabel,
  backTitle,
  backText,
}: {
  icon: React.ReactNode
  title: string
  badge: string
  intro: string
  bullets: string[]
  ctaHref: string
  ctaLabel: string
  backTitle: string
  backText: string
}) {
  return (
    <details className="group relative">
      {/* The summary becomes the "front" clickable area on mobile */}
      <summary className="list-none cursor-pointer">
        <div className="relative rounded-3xl border border-white/15 bg-white/5 p-7 shadow-sm backdrop-blur transition will-change-transform group-hover:-translate-y-0.5 group-hover:shadow-md focus-within:ring-2 focus-within:ring-memoir-gold/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl border border-white/15 bg-white/5 p-2 text-memoir-gold">
                {icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-memoir-gold">{badge}</p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Survoler ou toucher
            </span>
          </div>

          <p className="mt-5 text-sm leading-6 text-white/80">{intro}</p>

          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-memoir-gold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/90">
            <span className="text-memoir-gold">{GoldDot()}</span>
            <span className="text-white/70">Voir un aperçu</span>
            <span className="ml-1 text-white/60 transition group-hover:translate-x-0.5">
              →
            </span>
          </div>

          {/* Flip overlay (desktop hover + when <details> open) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 rounded-3xl",
              "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              "group-open:opacity-100"
            )}
          >
            {/* subtle gradient edge */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-memoir-gold/25" />
          </div>
        </div>
      </summary>

      {/* Back panel (revealed on open) */}
      <div className="mt-3 rounded-3xl border border-white/15 bg-white/5 p-7 shadow-sm backdrop-blur">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
          Aperçu final
        </p>
        <h4 className="mt-2 text-lg font-semibold tracking-tight text-white">
          {backTitle}
        </h4>
        <p className="mt-3 text-sm leading-6 text-white/80">{backText}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs text-white/60">Bloc image</p>
            <div className="mt-3 h-28 rounded-xl bg-white/10" />
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs text-white/60">Bloc citation</p>
            <div className="mt-3 h-28 rounded-xl bg-white/10" />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-2xl bg-memoir-gold px-6 py-3 text-sm font-semibold text-memoir-blue shadow-sm transition hover:opacity-95"
          >
            {ctaLabel}
          </Link>
          <span className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/70">
            Astuce: refermer en re-touchant la carte
          </span>
        </div>
      </div>
    </details>
  )
}

export default function TemplatePage() {
  return (
    <main className="min-h-screen bg-memoir-blue text-white">
      {/* Background: subtle living light */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-280px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-memoir-gold/20 blur-3xl" />
        <div className="absolute right-[-220px] top-[240px] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-[-240px] top-[520px] h-[520px] w-[520px] rounded-full bg-memoir-gold/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          {/* Keep your file name */}
          <Image
            src="/logo.png"
            alt="Et j’ai crié"
            width={480}
            height={160}
            className="h-20 w-auto rounded-md"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 sm:flex">
          <a href="#choix" className="transition hover:text-white">
            Choisir
          </a>
          <a href="#apercu" className="transition hover:text-white">
            Aperçu
          </a>
          <a href="#partage" className="transition hover:text-white">
            Partage
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-memoir-gold" />
            Sensible, sobre, vivant
          </span>
          <Link
            href="/questionnaire"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-white/10"
          >
            Questionnaire
          </Link>
          <Link
            href="/alma"
            className="rounded-xl bg-memoir-gold px-4 py-2 text-sm font-semibold text-memoir-blue shadow-sm transition hover:opacity-95"
          >
            ALMA
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-10 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              <Pill>Minimal chic</Pill>
              <Pill>Éditorial mémorial</Pill>
              <Pill>Micro-interactions</Pill>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Et j&apos;ai crié
            </h1>

            <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Créez un mémorial pour honorer
              <br />
              <span className="text-memoir-gold">une personne qui compte</span>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#choix"
                className="inline-flex items-center justify-center rounded-2xl bg-memoir-gold px-6 py-3 text-sm font-semibold text-memoir-blue shadow-sm transition hover:opacity-95"
              >
                Commencer
              </Link>
              <Link
                href="#apercu"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                Voir à quoi ça ressemble
              </Link>
            </div>

            <p className="text-xs text-white/55">
              Vous choisissez votre porte d’entrée. Le résultat final reste le même: un
              mémorial éditorial, lisible, élégant.
            </p>
          </div>

          {/* Right side: living preview block */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                Aperçu rapide
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                Une page finale “papier”
              </h3>
              <p className="mt-1 text-sm text-white/70">
                Chapitres, citations, galerie, et quelques détails vivants.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Image principale</p>
                  <div className="mt-3 h-28 rounded-xl bg-white/10" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["Photo", "Audio", "Texte"].map((x) => (
                    <div
                      key={x}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-center text-xs text-white/70 transition hover:bg-white/10"
                    >
                      {x}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-memoir-gold/35 bg-memoir-gold/10 px-4 py-3 text-xs text-white/80">
                  Gadget utile: sommaire cliquable, chapitres pliables, citations épinglées.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHOICE CARDS */}
      <section id="choix" className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Choisir un chemin
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Commencer simplement.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-white/75">
              Deux portes d’entrée. Une même destination.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FlipCard
            icon={<IconSparkle className="h-5 w-5" />}
            title="ALMA"
            badge="✨ Recommandé pour débuter"
            intro="Une conversation bienveillante qui vous guide en douceur, à votre rythme."
            bullets={[
              "Comme parler à quelqu'un qui écoute",
              "Questions adaptées à ce que vous partagez",
              "Sans pression ni jugement",
            ]}
            ctaHref="/alma"
            ctaLabel="Commencer avec ALMA"
            backTitle="Le mémorial après ALMA"
            backText="ALMA récolte des fragments. La génération les transforme en chapitres, citations, et sections. Ici, tu peux imaginer le rendu final (images, citation, structure)."
          />

          <FlipCard
            icon={<IconClipboard className="h-5 w-5" />}
            title="Questionnaire"
            badge="📋 Méthode classique"
            intro="Un formulaire structuré avec toutes les questions organisées par thème."
            bullets={[
              "Organisation claire et prévisible",
              "Toutes les questions visibles d'avance",
              "Progression étape par étape",
            ]}
            ctaHref="/questionnaire"
            ctaLabel="Remplir le questionnaire"
            backTitle="Le mémorial après le questionnaire"
            backText="Le questionnaire donne une matière très complète. La génération l’habille en page éditoriale: repères, anecdotes, galerie, voix. Même destination, autre route."
          />
        </div>

        <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-6 text-center text-sm text-white/80 backdrop-blur">
          <span className="text-memoir-gold">💫</span>{" "}
          <span className="font-medium">Les deux chemins mènent au même mémorial</span>
          <div className="mt-2 text-white/70">
            Vous pouvez basculer entre ALMA et le questionnaire à tout moment grâce à la bulle
            d&apos;assistance
          </div>
        </div>
      </section>

      {/* EDITORIAL PREVIEW */}
      <section id="apercu" className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Aperçu éditorial
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Une lecture calme, moderne.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Respiration, chapitres, sommaire. Des “gadgets” utiles, discrets, jamais
              envahissants.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                    Nom Prénom
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    1954 – 2023 ·{" "}
                    <span className="text-memoir-gold">
                      « Tenir est déjà beaucoup »
                    </span>
                  </p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Privé
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Image</p>
                  <div className="mt-3 h-40 rounded-xl bg-white/10" />
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Audio / Voix</p>
                  <div className="mt-3 h-40 rounded-xl bg-white/10" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="h-3 w-11/12 rounded bg-white/15" />
                <div className="h-3 w-10/12 rounded bg-white/15" />
                <div className="h-3 w-8/12 rounded bg-white/15" />
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {["Sommaire", "Chapitres", "Citations"].map((x) => (
                  <div
                    key={x}
                    className="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-center text-xs text-white/75 transition hover:bg-white/10"
                  >
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE */}
      <section id="partage" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-white/15 bg-white/5 p-10 text-center shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">
            Partage
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Un lien. Une lecture. Une trace.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/75">
            Un lien privé, une page fluide. Tout est pensé pour tenir dans le temps,
            sans alourdir l’émotion.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/alma"
              className="rounded-2xl bg-memoir-gold px-6 py-3 text-sm font-semibold text-memoir-blue shadow-sm transition hover:opacity-95"
            >
              Commencer avec ALMA
            </Link>
            <Link
              href="/questionnaire"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              Remplir le questionnaire
            </Link>
          </div>
        </div>

        <footer className="mx-auto mt-10 max-w-6xl px-0 text-center text-xs text-white/45">
        </footer>
      </section>
      <FooterLegal />
    </main>
  )
}
