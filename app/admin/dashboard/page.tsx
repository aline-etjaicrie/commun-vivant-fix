'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  FileText,
  QrCode,
  Users,
  Settings,
  LogOut,
  MapPin,
  Euro,
  Search,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

// Mock data for Pro Dashboard
const MOCK_CLIENTS = [
  {
    id: '1',
    familyName: 'Famille Dubois',
    deceasedName: 'Marie Dubois',
    email: 'contact@familledubois.fr',
    status: 'publie' as const,
    orderDate: '15/01/2026',
    funeralDate: '18/01/2026',
    qrStatus: 'envoye', // envoye, en_attente, installe
    paymentStatus: 'paye',
    amount: 150,
    commission: 30
  },
  {
    id: '2',
    familyName: 'Famille Martin',
    deceasedName: 'Jean Martin',
    email: 'pierre.martin@email.com',
    status: 'en-cours' as const,
    orderDate: '28/01/2026',
    funeralDate: '05/02/2026',
    qrStatus: 'en_attente',
    paymentStatus: 'en_attente',
    amount: 150,
    commission: 30
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'memorials' | 'billing'>('memorials');

  const filteredClients = clients.filter(c =>
    c.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.deceasedName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCommission = clients.reduce((sum, client) =>
    client.paymentStatus === 'paye' ? sum + client.commission : sum, 0
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Pro */}
      <header className="bg-[#0F2A44] border-b border-[#C9A24D]/30 sticky top-0 z-40 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A24D] rounded-full flex items-center justify-center font-serif italic text-[#0F2A44] font-bold text-xl">
              E
            </div>
            <div>
              <span className="text-lg font-medium block">Espace Partenaire</span>
              <span className="text-xs text-[#C9A24D] uppercase tracking-wider">Pompes Funèbres</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full">
              <span className="text-xs text-gray-300">Commissions ce mois :</span>
              <span className="text-[#C9A24D] font-bold">{totalCommission} €</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('memorials')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'memorials' ? 'bg-[#0F2A44] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Mémoriaux & Clients
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-[#0F2A44] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Facturation & Suivi
            </button>
          </div>

          <button
            onClick={() => alert('Ouverture du formulaire de création de compte client')}
            className="flex items-center gap-2 bg-[#C9A24D] hover:bg-[#E1C97A] text-[#0F2A44] px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nouveau Client
          </button>
        </div>

        {activeTab === 'memorials' ? (
          <>
            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une famille, un défunt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F2A44]/20 focus:border-[#0F2A44] outline-none shadow-sm"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mémoriaux actifs</p>
                  <p className="text-2xl font-bold text-[#0F2A44]">{clients.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#C9A24D]/20" />
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Plaques à installer</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {clients.filter(c => c.qrStatus === 'en_attente').length}
                  </p>
                </div>
                <QrCode className="w-8 h-8 text-orange-100" />
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-[#0F2A44]">Famille / Défunt</th>
                      <th className="px-6 py-4 font-semibold text-[#0F2A44]">État Mémorial</th>
                      <th className="px-6 py-4 font-semibold text-[#0F2A44]">Technique (QR/Plaque)</th>
                      <th className="px-6 py-4 font-semibold text-[#0F2A44]">Obsèques</th>
                      <th className="px-6 py-4 font-semibold text-[#0F2A44] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#0F2A44]">{client.deceasedName}</div>
                          <div className="text-xs text-gray-500">{client.familyName}</div>
                          <div className="text-xs text-gray-400 mt-1">{client.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {client.qrStatus === 'envoye' && (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs w-fit">
                                <CheckCircle className="w-3 h-3" /> QR Expédié
                              </span>
                            )}
                            {client.qrStatus === 'en_attente' && (
                              <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs w-fit">
                                <Clock className="w-3 h-3" /> En prod.
                              </span>
                            )}
                            <button className="text-xs text-[#0F2A44] hover:underline flex items-center gap-1 mt-1">
                              <QrCode className="w-3 h-3" /> Voir le code
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {client.funeralDate}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/${client.id}/location`)}
                            className="p-2 text-gray-500 hover:text-[#0F2A44] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Gérer la localisation"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('Impression fiche défunt')}
                            className="p-2 text-gray-500 hover:text-[#0F2A44] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Imprimer fiche"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Billing Tab Placeholder */
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#C9A24D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Euro className="w-8 h-8 text-[#C9A24D]" />
            </div>
            <h2 className="text-xl font-medium text-[#0F2A44] mb-2">Suivi de Facturation</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Retrouvez ici le détail de vos commissions et l'historique de facturation pour chaque mémorial créé.
            </p>
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Télécharger le rapport mensuel
            </button>
          </div>
        )}
      </main>
    </div>
  );
}