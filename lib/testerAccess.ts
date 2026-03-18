type TesterOptions = {
  publicOnly?: boolean;
};

function parseCsv(value?: string): Set<string> {
  if (!value) return new Set<string>();
  return new Set(
    value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
}

function getEmailSet(options?: TesterOptions): Set<string> {
  const values: string[] = [];
  if (process.env.NEXT_PUBLIC_TESTER_EMAILS) {
    values.push(process.env.NEXT_PUBLIC_TESTER_EMAILS);
  }
  if (!options?.publicOnly && process.env.TESTER_EMAILS) {
    values.push(process.env.TESTER_EMAILS);
  }
  return parseCsv(values.join(',').toLowerCase());
}

function getUserIdSet(options?: TesterOptions): Set<string> {
  const values: string[] = [];
  if (process.env.NEXT_PUBLIC_TESTER_USER_IDS) {
    values.push(process.env.NEXT_PUBLIC_TESTER_USER_IDS);
  }
  if (!options?.publicOnly && process.env.TESTER_USER_IDS) {
    values.push(process.env.TESTER_USER_IDS);
  }
  return parseCsv(values.join(','));
}

export function isTesterUser(
  user: { id?: string | null; email?: string | null } | null | undefined,
  options?: TesterOptions
): boolean {
  if (!user) return false;

  const email = (user.email || '').trim().toLowerCase();
  const userId = (user.id || '').trim();

  const testerEmails = getEmailSet(options);
  if (email && testerEmails.has(email)) return true;

  const testerUserIds = getUserIdSet(options);
  if (userId && testerUserIds.has(userId)) return true;

  return false;
}

