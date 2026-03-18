'use client';

import { useState } from 'react';
import { Link as LinkIcon, Plus, X, ExternalLink } from 'lucide-react';

interface Lien {
  id: string;
  url: string;
  titre?: string;
  description?: string;
}

interface LinkManagerProps {
  value: Lien[];
  onChange: (liens: Lien[]) => void;
}

export default function LinkManager({ value = [], onChange }: LinkManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', titre: '', description: '' });

  const handleAdd = () => {
    if (!newLink.url) return;

    const lien: Lien = {
      id: `${Date.now()}`,
      url: newLink.url,
      titre: newLink.titre || newLink.url,
      description: newLink.description,
    };

    onChange([...value, lien]);
    setNewLink({ url: '', titre: '', description: '' });
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((link) => link.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Bouton ajouter */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary flex items-center gap-2 w-full justify-center"
        >
          <Plus className="w-5 h-5" />
          Ajouter un lien
        </button>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="border-2 border-memoir-blue/20 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-memoir-blue font-medium mb-2">
              URL du lien *
            </label>
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-memoir-blue font-medium mb-2">
              Titre (facultatif)
            </label>
            <input
              type="text"
              value={newLink.titre}
              onChange={(e) => setNewLink({ ...newLink, titre: e.target.value })}
              placeholder="Nom du lien"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-memoir-blue font-medium mb-2">
              Description (facultatif)
            </label>
            <textarea
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              placeholder="Quelques mots sur ce lien..."
              rows={2}
              className="input-field"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary flex-1"
              disabled={!newLink.url}
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewLink({ url: '', titre: '', description: '' });
              }}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des liens */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-memoir-blue font-medium">Liens ajoutés :</h4>
          {value.map((lien) => (
            <div
              key={lien.id}
              className="border-2 border-memoir-blue/10 rounded-lg p-4 hover:border-memoir-gold/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="w-4 h-4 text-memoir-gold flex-shrink-0" />
                    <a
                      href={lien.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-memoir-blue hover:text-memoir-gold transition-colors font-medium flex items-center gap-1"
                    >
                      {lien.titre}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {lien.description && (
                    <p className="text-sm text-memoir-blue/70">{lien.description}</p>
                  )}
                  <p className="text-xs text-memoir-blue/50 mt-1 truncate">{lien.url}</p>
                </div>
                <button
                  onClick={() => handleRemove(lien.id)}
                  className="p-1 text-memoir-blue/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
