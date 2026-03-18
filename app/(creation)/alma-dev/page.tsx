'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AlmaDevContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('isolated', '1');
    router.replace(`/create/alma?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function AlmaDevPage() {
  return (
    <Suspense fallback={null}>
      <AlmaDevContent />
    </Suspense>
  );
}
