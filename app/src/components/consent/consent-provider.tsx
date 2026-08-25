"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  acceptAll as acceptAllDecision,
  createInitialConsentState,
  customizeConsent,
  readConsentCookie,
  rejectOptional as rejectOptionalDecision,
  writeConsentCookie,
  persistAndVerifyConsentDecision,
  type ConsentCategories,
  type ConsentDecision,
} from "@/lib/consent";
import {
  announceConsentDecision,
  announceConsentPersistenceFailure,
  announceHydratedConsent,
} from "@/data/shopify/analytics/events";
import { ConsentBanner } from "./consent-banner";
import { ConsentSettingsDialog } from "./consent-settings-dialog";

type ConsentContextValue = Readonly<{
  categories: ConsentCategories;
  isHydrated: boolean;
  isSettingsOpen: boolean;
  showBanner: boolean;
  storageError: string | null;
  acceptAll: () => void;
  rejectOptional: () => void;
  saveCustomization: (categories: Partial<ConsentCategories>) => void;
  openSettings: () => void;
  closeSettings: () => void;
}>;

const ConsentContext = createContext<ConsentContextValue | null>(null);
const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [explicitDecision, setExplicitDecision] = useState<ConsentDecision | null | undefined>(undefined);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const persistedDecision = useMemo(
    () => isHydrated ? readConsentCookie() : null,
    [isHydrated],
  );
  const state = createInitialConsentState(
    explicitDecision === undefined ? persistedDecision : explicitDecision,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const hydrationAnnounced = useRef(false);

  useEffect(() => {
    if (persistedDecision && !hydrationAnnounced.current) {
      hydrationAnnounced.current = true;
      announceHydratedConsent(persistedDecision);
    }
  }, [persistedDecision]);

  const persistExplicitDecision = useCallback((decision: ConsentDecision) => {
    const saved = persistAndVerifyConsentDecision(decision, {
      write: writeConsentCookie,
      read: readConsentCookie,
      announce: announceConsentDecision,
    });
    if (saved) {
      setExplicitDecision(decision);
      setIsSettingsOpen(false);
      setStorageError(null);
      return;
    }

    announceConsentPersistenceFailure();
    setExplicitDecision(null);
    setStorageError("We could not save your privacy choice. Optional processing remains disabled. Please try again.");
  }, []);

  const acceptAll = useCallback(() => {
    const next = acceptAllDecision(state).decision;
    if (next) persistExplicitDecision(next);
  }, [persistExplicitDecision, state]);

  const rejectOptional = useCallback(() => {
    const next = rejectOptionalDecision(state).decision;
    if (next) persistExplicitDecision(next);
  }, [persistExplicitDecision, state]);

  const saveCustomization = useCallback((categories: Partial<ConsentCategories>) => {
    const next = customizeConsent(state, categories).decision;
    if (next) persistExplicitDecision(next);
  }, [persistExplicitDecision, state]);

  const value = useMemo<ConsentContextValue>(() => ({
    categories: state.categories,
    isHydrated,
    isSettingsOpen,
    showBanner: isHydrated && state.decision === null,
    storageError,
    acceptAll,
    rejectOptional,
    saveCustomization,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
  }), [
    acceptAll,
    isHydrated,
    isSettingsOpen,
    rejectOptional,
    saveCustomization,
    state.categories,
    state.decision,
    storageError,
  ]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <ConsentBanner />
      <ConsentSettingsDialog />
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used within ConsentProvider");
  return context;
}
