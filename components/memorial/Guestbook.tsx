'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, CheckCircle, Send } from 'lucide-react';

export default function MemorialGuestbook({ memoryId }: { memoryId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', content: '' });
    const [submitted, setSubmitted] = useState(false);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.content) return;

        // Optimistic UI update or fetch?
        setSubmitted(true);

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    memory_id: memoryId,
                    author_name: formData.name,
                    content: formData.content,
                    status: 'pending'
                });

            if (error) throw error;
        } catch (e) {
            console.error("Error submitting message:", e);
            setSubmitted(false); // Revert if failed
            alert("Une erreur est survenue, veuillez réessayer.");
        }
    };

    if (submitted) {
        return (
            <div className="bg-[#FDFBF7] border border-[#D4AF37]/20 p-12 text-center rounded-2xl animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-serif text-[#1A1A2E] mb-3 font-semibold">Message envoyé</h3>
                <p className="text-[#1A1A2E]/60 font-light text-lg">Merci pour votre témoignage. Il sera visible après modération.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#D4AF37]/10 max-w-3xl mx-auto backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-50"></div>

            <h3 className="text-2xl font-serif text-[#1A1A2E] mb-8 text-center flex items-center justify-center gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
                Laisser un témoignage
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group/input">
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder=" "
                        className="peer w-full bg-[#FDFBF7] border border-stone-200 rounded-xl px-5 py-4 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all font-medium text-[#1A1A2E]"
                    />
                    <label className="absolute left-5 top-4 text-[#1A1A2E]/40 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-focus:font-bold uppercase tracking-wider pointer-events-none bg-transparent">
                        Votre nom
                    </label>
                </div>

                <div className="relative group/input">
                    <textarea
                        rows={5}
                        required
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder=" "
                        className="peer w-full bg-[#FDFBF7] border border-stone-200 rounded-xl px-5 py-4 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all resize-none text-[#1A1A2E] leading-relaxed"
                    />
                    <label className="absolute left-5 top-4 text-[#1A1A2E]/40 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-[#D4AF37] peer-focus:font-bold uppercase tracking-wider pointer-events-none">
                        Votre message...
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#1A1A2E] text-white py-4 rounded-xl font-bold hover:bg-[#1A1A2E]/90 transition-all active:scale-[0.99] flex items-center justify-center gap-3 shadow-lg hover:shadow-[#1A1A2E]/20 text-sm tracking-wide uppercase"
                >
                    Envoyer <Send className="w-4 h-4" />
                </button>
            </form>

            <p className="text-center text-[10px] text-[#1A1A2E]/30 mt-6 uppercase tracking-widest">
                Votre message sera privé jusqu'à validation par la famille.
            </p>
        </div>
    );
}
