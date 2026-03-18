'use client';

import { useState } from 'react';
import { Shield, AlertCircle, Eye, Trash2, Archive, Mail } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MOCK_REPORTS = [
    {
        id: '1',
        date: '15/01/2026',
        commonName: 'Jean Martin',
        context: 'Funéraire',
        reason: "Droit à l'image",
        reporter: 'user@email.com',
        status: 'pending'
    },
    {
        id: '2',
        date: '12/01/2026',
        commonName: 'Marie Dupont',
        context: 'Histoire de vie',
        reason: "Diffamation",
        reporter: 'sibling@email.com',
        status: 'reviewed'
    },
    {
        id: '3',
        date: '10/01/2026',
        commonName: 'Le Fauteuil Rouge',
        context: 'Objet',
        reason: "Autre",
        reporter: 'neighbor@email.com',
        status: 'archived'
    }
];

export default function ModerationPage() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [filter, setFilter] = useState('all');

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.status === filter);

    const handleAction = (id: string, action: string) => {
        if (confirm(`Êtes-vous sûr de vouloir ${action} ce signalement ?`)) {
            // Simulate API call
            setReports(prev => prev.map(r =>
                r.id === id ? { ...r, status: action === 'archiver' ? 'archived' : 'reviewed' } : r
            ));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-[#0F2A44] mb-2">Modération</h1>
                    <p className="text-gray-500">Gestion des signalements et contenus inappropriés</p>
                </div>
                <Link href="/admin" className="text-sm text-gray-500 hover:text-[#0F2A44]">
                    Retour au dashboard admin
                </Link>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-full">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">En attente</p>
                            <p className="text-2xl font-bold text-[#0F2A44]">
                                {reports.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Traités ce mois</p>
                            <p className="text-2xl font-bold text-[#0F2A44]">12</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'reviewed', 'archived'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === status
                                ? 'bg-[#0F2A44] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {status === 'all' ? 'Tous' :
                            status === 'pending' ? 'En attente' :
                                status === 'reviewed' ? 'Traités' : 'Archivés'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commun</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Raison</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Signalant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">{report.date}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-[#0F2A44]">{report.commonName}</div>
                                    <div className="text-xs text-gray-400">{report.context}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                        {report.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{report.reporter}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                            report.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {report.status === 'pending' ? 'En attente' :
                                            report.status === 'archived' ? 'Archivé' : 'Traité'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button title="Voir le commun" className="p-1 text-gray-400 hover:text-[#0F2A44]">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button title="Contacter" className="p-1 text-gray-400 hover:text-blue-600">
                                            <Mail className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(report.id, 'archiver')}
                                            title="Archiver (masquer)"
                                            className="p-1 text-gray-400 hover:text-orange-600"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                        <button title="Supprimer définitivement" className="p-1 text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredReports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    Aucun signalement trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
