'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname || '/espace/accueil')}`);
        return;
      }
      if (!cancelled) setReady(true);
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return <div className="min-h-screen bg-[#F7F7F5] p-8 text-sm text-[#6B7280]">Verification de session...</div>;
  }

  return <>{children}</>;
}
