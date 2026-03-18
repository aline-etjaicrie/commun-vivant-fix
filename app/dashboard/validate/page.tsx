'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ValidateEditorPage from '@/components/dashboard/ValidateEditorPage';
import { STORAGE_KEYS } from '@/lib/creationFlowStorage';

export default function DashboardValidatePage() {
  return (
    <Suspense fallback={<ValidatePageFallback />}>
      <DashboardValidatePageContent />
    </Suspense>
  );
}

function ValidatePageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] text-[#0F2A44]">
      Chargement de la relecture...
    </div>
  );
}

function DashboardValidatePageContent() {
  const searchParams = useSearchParams();
  const memoryId =
    searchParams?.get('memoryId') ||
    (typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.currentMemorialId) || ''
      : '');

  return <ValidateEditorPage memoryId={memoryId} />;
}
