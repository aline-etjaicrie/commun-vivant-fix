'use client';

import ProShell from '@/components/pro/ProShell';
import StatCard from '@/components/pro/StatCard';
import { computeCommissionSummary } from '@/lib/pro/finance';
import { useProStore } from '@/lib/pro/store';

export default function ProCommissionsPage() {
  const { state, hydrated } = useProStore();

  if (!hydrated) {
    return (
      <ProShell title="Commissions" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  const summary = computeCommissionSummary(state);

  return (
    <ProShell
      title="Commissions"
      subtitle="Commission fixe 20 EUR par memorial, credit cumule et deduction au renouvellement"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solde actuel" value={`${summary.currentCredit.toFixed(0)} EUR`} />
        <StatCard label="Memoriaux vendus" value={String(summary.soldCount)} />
        <StatCard label="Commission cumulee" value={`${summary.commissionCumulative.toFixed(0)} EUR`} />
        <StatCard label="Prochain renouvellement" value={new Date(summary.renewalDate).toLocaleDateString('fr-FR')} />
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Simulation renouvellement</h2>
        <div className="mt-3 space-y-2 text-sm text-[#33475B]">
          <p>Abonnement annuel: {state.agency.subscriptionPrice.toFixed(0)} EUR</p>
          <p>
            Situation: {summary.isRenewalCovered ? 'Renouvellement couvert par le credit.' : `Reste a payer ${summary.renewalGap.toFixed(0)} EUR.`}
          </p>
          <p>
            Regle surplus: {summary.annualTransferEligibleAmount > 0
              ? `Eligible a virement annuel: ${summary.annualTransferEligibleAmount.toFixed(0)} EUR`
              : 'Pas de surplus > 300 EUR apres couverture abonnement.'}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Historique annuel (MVP)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4EAF0] text-xs uppercase tracking-wide text-[#6B7A89]">
                <th className="py-2">Date</th>
                <th className="py-2">Memorial</th>
                <th className="py-2">Paiement famille</th>
                <th className="py-2">Commission agence</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {state.memorials.map((m) => (
                <tr key={m.id} className="border-b border-[#F0F3F6]">
                  <td className="py-3">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3">{m.subjectName}</td>
                  <td className="py-3">{m.totalPaid.toFixed(0)} EUR</td>
                  <td className="py-3">{m.agencyCommission.toFixed(0)} EUR</td>
                  <td className="py-3">{m.commissionStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Facturation agence</h2>
        {state.billingDocuments.length === 0 ? (
          <p className="mt-3 text-sm text-[#5A6B7B]">Aucun document de facturation disponible pour le moment.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4EAF0] text-xs uppercase tracking-wide text-[#6B7A89]">
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Montant</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Acces</th>
                </tr>
              </thead>
              <tbody>
                {state.billingDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-[#F0F3F6]">
                    <td className="py-3">{new Date(doc.issuedAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3">{doc.docType}</td>
                    <td className="py-3">{(doc.amountCents / 100).toFixed(2)} {doc.currency}</td>
                    <td className="py-3">{doc.status}</td>
                    <td className="py-3">
                      {doc.invoicePdfUrl ? (
                        <a className="text-[#0B66C3] underline" href={doc.invoicePdfUrl} target="_blank" rel="noreferrer">
                          PDF
                        </a>
                      ) : doc.hostedInvoiceUrl ? (
                        <a className="text-[#0B66C3] underline" href={doc.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                          Ouvrir
                        </a>
                      ) : (
                        <span className="text-[#6B7A89]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ProShell>
  );
}
