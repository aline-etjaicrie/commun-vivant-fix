import TemplateClassique from '@/components/templates/TemplateClassique';
import TemplateModerne from '@/components/templates/TemplateModerne';
import TemplateIntime from '@/components/templates/TemplateIntime';
import TemplateGalerie from '@/components/templates/TemplateGalerie';

export function PublicUnavailablePage(props: {
  title: string;
  message: string;
  agencyName?: string | null;
}) {
  return (
    <main className="min-h-screen bg-[#F7F7F5] px-6 py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
        {!!props.agencyName && <p className="text-xs uppercase tracking-wide text-[#6B7280]">{props.agencyName}</p>}
        <h1 className="mt-2 text-2xl font-semibold text-[#1F2B35]">{props.title}</h1>
        <p className="mt-3 text-sm text-[#5E6B78]">{props.message}</p>
      </div>
    </main>
  );
}

export function PublicMemorialRenderer(props: {
  memory: any;
  agency?: { name?: string | null; logo_url?: string | null; partner_mention?: string | null; display_name?: string | null } | null;
  mode: 'b2c' | 'b2b';
}) {
  const { memory, agency, mode } = props;
  const choice = memory.template_choice || 'classique';

  const template =
    choice === 'moderne' ? (
      <TemplateModerne memory={memory} />
    ) : choice === 'intime' ? (
      <TemplateIntime memory={memory} />
    ) : choice === 'galerie' ? (
      <TemplateGalerie memory={memory} />
    ) : (
      <TemplateClassique memory={memory} />
    );

  if (mode === 'b2c') {
    return template;
  }

  const agencyName = agency?.display_name || agency?.name || 'Agence partenaire';
  const partnerMention = agency?.partner_mention || 'Réalisé avec Commun Vivant';

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {agency?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logo_url} alt={agencyName} className="h-9 w-9 rounded object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[#13212E] text-xs text-white">PF</div>
            )}
            <span className="text-sm font-medium text-[#1F2B35]">{agencyName}</span>
          </div>
          <span className="text-xs text-[#6B7280]">{partnerMention}</span>
        </div>
      </header>
      {template}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-[#6B7280]">
          Réalisé avec Commun Vivant
        </div>
      </footer>
    </div>
  );
}

