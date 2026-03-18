'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function QuestionnaireDevContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('isolated', '1');
    router.replace(`/create/questionnaire?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function QuestionnaireDevPage() {
  return (
    <Suspense fallback={null}>
      <QuestionnaireDevContent />
    </Suspense>
  );
}
