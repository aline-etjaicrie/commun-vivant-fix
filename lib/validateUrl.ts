export function getValidateUrl(memoryId: string, tab?: string): string {
  const params = new URLSearchParams();

  if (memoryId) {
    params.set('memoryId', memoryId);
  }

  if (tab) {
    params.set('tab', tab);
  }

  const query = params.toString();
  return query ? `/dashboard/validate?${query}` : '/dashboard/validate';
}
