'use client';

import { useEffect } from 'react';

export default function HomeScrollReset() {
  useEffect(() => {
    // If no anchor/hash is targeted, always start homepage at top.
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  return null;
}
