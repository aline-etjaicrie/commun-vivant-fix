'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Check, X, Flag, Clock, MessageSquare, AlertCircle } from 'lucide-react';

const supabase = createClient();

interface Message {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  status: string;
  flagged: boolean;
  flagged_reason?: string;
  approved: boolean;
}

export default function ModerationPage() {
  const params = useParams();
  const memoryId = String(params?.id || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const router = useRouter();

  const getAccessToken = async () => {
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token || null;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setNotice(null);

        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/messages`)}`);
          return;
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
          router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/messages`)}`);
          return;
        }

        const response = await fetch(`/api/user-dashboard/messages?memoryId=${encodeURIComponent(memoryId)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || 'Chargement des messages impossible');
        }

        setMessages(payload?.messages || []);
      } catch (error: any) {
        console.error('Messages page load error:', error);
        setNotice({
          type: 'error',
          message: error?.message || 'La moderation ne peut pas encore etre chargee.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memoryId) void fetchMessages();
  }, [memoryId, router]);

  const handleAction = async (id: string, action: 'approve' | 'delete') => {
    try {
      setNotice(null);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/messages`)}`);
        return;
      }

      const response = await fetch('/api/user-dashboard/messages', {
        method: action === 'approve' ? 'PATCH' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(action === 'approve' ? { id, status: 'approved' } : { id }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Action impossible');
      }

      if (action === 'approve') {
        setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, approved: true, status: 'approved' } : message)));
        setNotice({ type: 'success', message: 'Le message a bien ete approuve.' });
      } else {
        setMessages((prev) => prev.filter((message) => message.id !== id));
        setNotice({ type: 'success', message: 'Le message a bien ete supprime.' });
      }
    } catch (error: any) {
      console.error('Messages action error:', error);
      setNotice({
        type: 'error',
        message: error?.message || 'Cette action n a pas pu aboutir.',
      });
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === 'pending') return !message.approved && !message.flagged;
    if (filter === 'flagged') return message.flagged;
    return true;
  });

  const getStatusBadge = (message: Message) => {
    if (message.flagged) {
      return (
        <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Flag className="w-3 h-3" /> Flague
        </span>
      );
    }
    if (message.approved) {
      return (
        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Check className="w-3 h-3" /> Approuve
        </span>
      );
    }
    return (
      <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
        <Clock className="w-3 h-3" /> En attente
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-400">Chargement des messages...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-serif font-bold text-[#1A1A2E] mb-8">Moderation des messages</h1>

      {notice && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${
            notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice.message}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-8 border-b border-stone-100 pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-[#1A1A2E] text-white' : 'text-stone-400 hover:text-[#1A1A2E]'}`}
        >
          Tous ({messages.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-[#1A1A2E] text-white' : 'text-stone-400 hover:text-[#1A1A2E]'}`}
        >
          En attente ({messages.filter((message) => !message.approved && !message.flagged).length})
        </button>
        <button
          onClick={() => setFilter('flagged')}
          className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${filter === 'flagged' ? 'bg-red-500 text-white' : 'text-red-400 hover:text-red-600'}`}
        >
          Flagues ({messages.filter((message) => message.flagged).length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-xl">Aucun message dans cette categorie.</div>
        )}

        {filteredMessages.map((message) => (
          <div key={message.id} className={`p-6 rounded-xl border ${message.flagged ? 'border-red-200 bg-red-50/50' : 'border-stone-200 bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C9A24D]" />
                  {message.author_name}
                </h3>
                <p className="text-xs text-stone-400">{new Date(message.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              {getStatusBadge(message)}
            </div>

            {message.flagged && (
              <div className="mb-4 text-xs text-red-600 font-bold bg-white/50 p-2 rounded">
                {message.flagged_reason || 'Contenu suspect'}
              </div>
            )}

            <p className="text-stone-700 italic mb-6">"{message.content}"</p>

            <div className="flex gap-3">
              {!message.approved && (
                <button
                  onClick={() => handleAction(message.id, 'approve')}
                  className="px-4 py-2 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approuver
                </button>
              )}
              <button
                onClick={() => handleAction(message.id, 'delete')}
                className="px-4 py-2 bg-stone-200 text-stone-600 rounded text-xs font-bold hover:bg-stone-300 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
