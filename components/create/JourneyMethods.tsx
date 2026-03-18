'use client';

import Link from 'next/link';
import { ChevronLeft, FileText, MessageCircle, PenLine, PenTool, Sparkles } from 'lucide-react';
import { getCommunTypeConfig, type CommunType } from '@/lib/communTypes';

type JourneyMethodsProps = {
  communType: CommunType;
  almaHref: string;
  questionnaireHref: string;
  libreHref: string;
  backHref: string;
  backLabel: string;
};

export default function JourneyMethods({
  communType,
  almaHref,
  questionnaireHref,
  libreHref,
  backHref,
  backLabel,
}: JourneyMethodsProps) {
  const config = getCommunTypeConfig(communType);
  const isProCeremony = communType === 'pro-ceremonie';

  return (
    <div className="min-h-screen bg-memoir-bg py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <Link
            href={backHref}
            className="inline-flex items-center text-memoir-blue/40 hover:text-memoir-blue transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {backLabel}
          </Link>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-16 h-1 bg-memoir-gold/30 mx-auto rounded-full mb-6" />
            <h1 className="text-3xl md:text-5xl font-serif italic text-memoir-blue leading-tight">{config.title}</h1>
            <p className="text-memoir-blue/60 text-lg font-light">{config.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <Link
            href={almaHref}
            className="group relative bg-white rounded-[32px] p-8 border border-memoir-gold/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-memoir-gold" />
            </div>
            <div className="w-16 h-16 bg-memoir-bg rounded-2xl flex items-center justify-center text-memoir-gold mb-6 group-hover:bg-memoir-gold group-hover:text-white transition-colors">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif italic text-memoir-blue mb-3">
              {isProCeremony ? 'Module Solenn' : 'Raconter avec Alma'}
            </h3>
            <p className="text-memoir-blue/60 text-sm leading-relaxed mb-6 flex-grow">
              {isProCeremony
                ? 'Redaction de ceremonies civiles en 4 ecrans: collecte, generation, edition, historique.'
                : 'Assistant conversationnel adapte au type de commun choisi.'}
            </p>
          </Link>

          <Link
            href={questionnaireHref}
            className="group relative bg-white rounded-[32px] p-8 border border-memoir-blue/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
              <FileText className="w-24 h-24 text-memoir-blue" />
            </div>
            <div className="w-16 h-16 bg-memoir-bg rounded-2xl flex items-center justify-center text-memoir-blue mb-6 group-hover:bg-memoir-blue group-hover:text-white transition-colors">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif italic text-memoir-blue mb-3">Questionnaire</h3>
            <p className="text-memoir-blue/60 text-sm leading-relaxed mb-6 flex-grow">
              Version structuree specifique au type de commun.
            </p>
          </Link>

          <Link
            href={libreHref}
            className="group relative bg-white rounded-[32px] p-8 border border-memoir-blue/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
              <PenLine className="w-24 h-24 text-memoir-blue" />
            </div>
            <div className="w-16 h-16 bg-memoir-bg rounded-2xl flex items-center justify-center text-memoir-blue/60 mb-6 group-hover:bg-memoir-blue/60 group-hover:text-white transition-colors">
              <PenTool className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif italic text-memoir-blue mb-3">Ecriture libre</h3>
            <p className="text-memoir-blue/60 text-sm leading-relaxed mb-6 flex-grow">
              Redaction manuelle, avec toutes les options d'edition ensuite.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
