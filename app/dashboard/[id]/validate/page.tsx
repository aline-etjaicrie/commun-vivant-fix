'use client';

import { useParams } from 'next/navigation';
import ValidateEditorPage from '@/components/dashboard/ValidateEditorPage';

export default function ValidatePage() {
  const params = useParams();
  const memoryId = String(params?.id || '');

  return <ValidateEditorPage memoryId={memoryId} />;
}
