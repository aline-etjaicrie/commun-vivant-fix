'use client';

import { useEffect, useState } from 'react';

export default function VirtualCandle() {
    const [flicker, setFlicker] = useState(1);

    // Simulation aléatoire du vent sur la flamme
    useEffect(() => {
        const interval = setInterval(() => {
            setFlicker(0.9 + Math.random() * 0.2);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-end h-48 w-full">
            {/* Halo de lumière (Glow) */}
            <div
                className="absolute top-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl transition-opacity duration-100"
                style={{ opacity: flicker * 0.6 }}
            />

            {/* Flamme */}
            <div className="relative mb-2">
                <div
                    className="w-4 h-8 bg-gradient-to-t from-orange-600 via-orange-300 to-white rounded-full blur-[2px] animate-pulse"
                    style={{
                        transform: `scale(${flicker}) rotate(${Math.random() * 4 - 2}deg)`,
                        boxShadow: '0 0 20px 2px rgba(255, 165, 0, 0.6)'
                    }}
                />
                {/* Mèche */}
                <div className="w-1 h-3 bg-black/60 mx-auto mt-[-4px]" />
            </div>

            {/* Corps de la bougie */}
            <div className="w-16 h-28 bg-gradient-to-r from-stone-100 via-white to-stone-200 rounded-t-lg shadow-lg relative overflow-hidden">
                {/* Effet cire fondue */}
                <div className="absolute top-0 w-full h-4 bg-white/80 rounded-full blur-[1px]" />
                <div className="absolute top-2 left-2 w-2 h-8 bg-white/60 rounded-full blur-[1px]" />
            </div>

            {/* Base / Support */}
            <div className="w-24 h-3 bg-[#1a1a1a] rounded-full mt-[-10px] shadow-xl z-[-1]" />
        </div>
    );
}
