export const CONSENT_VERSION = 1 as const;
export const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1_000;

export type ConsentCategories = Readonly<{
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}>;

export type ConsentDecision = Readonly<{
  version: typeof CONSENT_VERSION;
  decidedAt: string;
  expiresAt: string;
  categories: ConsentCategories;
}>;

export type ConsentState = Readonly<{
  decision: ConsentDecision | null;
  categories: ConsentCategories;
  isSettingsOpen: boolean;
}>;

export type ConsentAction =
  | Readonly<{ type: "acceptAll"; now: Date }>
  | Readonly<{ type: "rejectOptional"; now: Date }>
  | Readonly<{ type: "customize"; categories: Partial<ConsentCategories>; now: Date }>
  | Readonly<{ type: "reopen" }>
  | Readonly<{ type: "hydrate"; decision: ConsentDecision | null }>;

export const DEFAULT_CONSENT_CATEGORIES: ConsentCategories = Object.freeze({
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
});

export function createInitialConsentState(decision: ConsentDecision | null = null): ConsentState {
  return {
    decision,
    categories: decision?.categories ?? DEFAULT_CONSENT_CATEGORIES,
    isSettingsOpen: false,
  };
}

function createDecision(categories: ConsentCategories, now: Date): ConsentDecision {
  return {
    version: CONSENT_VERSION,
    decidedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CONSENT_DURATION_MS).toISOString(),
    categories,
  };
}

function saveDecision(state: ConsentState, categories: ConsentCategories, now: Date): ConsentState {
  const decision = createDecision(categories, now);
  return { ...state, decision, categories, isSettingsOpen: false };
}

export function consentReducer(state: ConsentState, action: ConsentAction): ConsentState {
  switch (action.type) {
    case "acceptAll":
      return saveDecision(
        state,
        { necessary: true, analytics: true, preferences: true, marketing: true },
        action.now,
      );
    case "rejectOptional":
      return saveDecision(state, DEFAULT_CONSENT_CATEGORIES, action.now);
    case "customize":
      return saveDecision(
        state,
        {
          necessary: true,
          analytics: action.categories.analytics === true,
          preferences: action.categories.preferences === true,
          marketing: action.categories.marketing === true,
        },
        action.now,
      );
    case "reopen":
      return { ...state, isSettingsOpen: true };
    case "hydrate":
      return createInitialConsentState(action.decision);
  }
}

export const acceptAll = (state: ConsentState, now = new Date()): ConsentState =>
  consentReducer(state, { type: "acceptAll", now });

export const rejectOptional = (state: ConsentState, now = new Date()): ConsentState =>
  consentReducer(state, { type: "rejectOptional", now });

export const customizeConsent = (
  state: ConsentState,
  categories: Partial<ConsentCategories>,
  now = new Date(),
): ConsentState => consentReducer(state, { type: "customize", categories, now });

export const reopenConsent = (state: ConsentState): ConsentState =>
  consentReducer(state, { type: "reopen" });
