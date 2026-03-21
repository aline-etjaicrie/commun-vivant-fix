'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { BLOCK_ICON_COMPONENTS } from '@/lib/blockIconRegistry';

interface LucideIconPickerProps {
    onSelect: (iconName: string) => void;
    onClose: () => void;
    currentIcon?: string;
}

const POPULAR_ICONS = Object.keys(BLOCK_ICON_COMPONENTS);

export default function LucideIconPicker({ onSelect, onClose, currentIcon }: LucideIconPickerProps) {
    const [search, setSearch] = useState('');

    const filteredIcons = POPULAR_ICONS.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    const renderIcon = (name: string) => {
        const IconComponent = BLOCK_ICON_COMPONENTS[name];
        if (!IconComponent) return null;
        return <IconComponent className="w-6 h-6" />;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-serif text-[#0F2A44]">Choisir une icône</h3>
                        <p className="text-xs text-gray-400">Sélectionnez le symbole qui illustre ce bloc</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une icône (ex: coeur, musique...)"
                        value={search}
                        onChange={(e) => setSearch(search === '' ? e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) : e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#C9A24D]/20 focus:outline-none transition-all"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {filteredIcons.map(name => (
                            <button
                                key={name}
                                onClick={() => onSelect(name)}
                                className={`aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all group
                                    ${currentIcon === name
                                        ? 'border-[#C9A24D] bg-[#C9A24D]/5 text-[#0F2A44]'
                                        : 'border-gray-50 hover:border-gray-200 text-gray-400 hover:text-gray-600'
                                    }`}
                                title={name}
                            >
                                {renderIcon(name)}
                                <span className="text-[10px] truncate max-w-full px-1">{name}</span>
                            </button>
                        ))}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic text-sm">
                            Aucune icône trouvée pour "{search}"
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}
