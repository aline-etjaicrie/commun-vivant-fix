'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function MemorialCandles({ memoryId }: { memoryId: string }) {
    const [count, setCount] = useState(0);
    const [lit, setLit] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                // Count candles for this memory
                const { count: c, error } = await supabase
                    .from('candles')
                    .select('*', { count: 'exact', head: true })
                    .eq('memory_id', memoryId);

                if (!error && c !== null) setCount(c);

                // Check if user already lit (localStorage)
                const hasLit = localStorage.getItem(`candle_${memoryId}`);
                if (hasLit) setLit(true);

                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchCount();

        // Subscribe to changes in real-time if supported
        // ... skipping for MVP simplicity ...
        const channel = supabase
            .channel('candles')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'candles', filter: `memory_id=eq.${memoryId}` }, (payload) => {
                setCount(prev => prev + 1);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [memoryId]);

    const handleLight = async () => {
        if (lit) return;

        setLit(true);
        setCount(prev => prev + 1); // Optimistic UI
        localStorage.setItem(`candle_${memoryId}`, 'true');

        try {
            // Insert candle record
            const { error } = await supabase
                .from('candles')
                .insert({ memory_id: memoryId });

            if (error) throw error;
        } catch (e) {
            console.error(e);
            // Revert optimistic if needed, but not critical for candles
        }
    };

    return (
        <div className="text-center py-12">
            <h3 className="text-2xl font-serif mb-8 text-white/90">Allumer une bougie</h3>

            <div className="relative inline-block group">
                <button
                    onClick={handleLight}
                    disabled={lit || loading}
                    className={`
                    w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700
                    ${lit
                            ? 'bg-[#D4AF37]/20 shadow-[0_0_60px_#D4AF37] scale-110'
                            : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                        }
                `}
                >
                    <Flame
                        className={`w-10 h-10 transition-all duration-700 ${lit ? 'text-[#D4AF37] animate-pulse drop-shadow-[0_0_15px_#D4AF37]' : 'text-white/50'}`}
                        fill={lit ? '#D4AF37' : 'none'}
                    />
                </button>
                {lit && <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-full animate-pulse transition-opacity duration-1000"></div>}
            </div>

            <p className="mt-6 text-white/60 font-medium tracking-widest text-sm uppercase">
                {loading ? '...' : (
                    <>
                        <span className="text-[#D4AF37] font-bold text-lg mr-2">{count}</span>
                        bougies allumées
                    </>
                )}
            </p>
        </div>
    );
}
