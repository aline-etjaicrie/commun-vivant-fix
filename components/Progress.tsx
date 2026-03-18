'use client';

import { Suspense } from 'react';
import React from 'react';

// Wrapper for Progress component
export default function Progress({ current, total }: { current: number, total: number }) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full bg-[#D4AF37]/10 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-[#D4AF37] transition-all duration-300 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
