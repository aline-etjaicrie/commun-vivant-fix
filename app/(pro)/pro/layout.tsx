'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname || '/pro/accueil')}`);
        return;
      }

      const res = await fetch('/api/pro/context', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.replace('/dashboard');
        return;
      }

      if (!cancelled) setReady(true);
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] p-8 text-sm text-[#5A6B7B]">
        Verification de votre acces pro...
      </div>
    );
  }

  return <>{children}</>;
}
