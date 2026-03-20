'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useBetaAccess(): boolean {
  const [isBeta, setIsBeta] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || '';
      const betaEmails = (process.env.NEXT_PUBLIC_BETA_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      setIsBeta(betaEmails.includes(email.toLowerCase()));
    });
  }, []);

  return isBeta;
}
