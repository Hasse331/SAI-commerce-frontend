import type { ConsentDecision } from "./domain";

type ConsentPersistenceDependencies = Readonly<{
  write: (decision: ConsentDecision) => void;
  read: () => ConsentDecision | null;
  announce: (decision: ConsentDecision) => void;
}>;

function decisionsMatch(expected: ConsentDecision, actual: ConsentDecision | null): boolean {
  return actual !== null &&
    actual.version === expected.version &&
    actual.decidedAt === expected.decidedAt &&
    actual.expiresAt === expected.expiresAt &&
    actual.categories.necessary === expected.categories.necessary &&
    actual.categories.analytics === expected.categories.analytics &&
    actual.categories.preferences === expected.categories.preferences &&
    actual.categories.marketing === expected.categories.marketing;
}

export function persistAndVerifyConsentDecision(
  decision: ConsentDecision,
  dependencies: ConsentPersistenceDependencies,
): boolean {
  try {
    dependencies.write(decision);
    const persisted = dependencies.read();
    if (!decisionsMatch(decision, persisted)) return false;
    dependencies.announce(decision);
    return true;
  } catch {
    return false;
  }
}
