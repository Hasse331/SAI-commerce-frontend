import type { ConsentCategories, ConsentState } from "@/lib/consent";

export type OptionalConsentCategory = "analytics" | "preferences" | "marketing";
export type CustomizationDraft = Readonly<Record<OptionalConsentCategory, boolean>>;

export const CONSENT_UI_TEXT = {
  customize: "Customize",
  rejectOptional: "Reject optional",
  acceptAll: "Accept all",
  saveChoices: "Save choices",
  reopen: "Cookie settings",
} as const;

const categoryContent = {
  necessary: {
    label: "Necessary",
    description: "Required for core storefront features such as cart and consent storage.",
  },
  analytics: {
    label: "Analytics",
    description: "Helps us understand storefront visits through Shopify Analytics.",
  },
  preferences: {
    label: "Preferences",
    description: "Allows optional settings that remember how you use the storefront.",
  },
  marketing: {
    label: "Marketing",
    description: "Allows optional marketing features. No marketing pixels are currently installed.",
  },
} as const;

export function createCustomizationDraft(categories: ConsentCategories): CustomizationDraft {
  return {
    analytics: categories.analytics,
    preferences: categories.preferences,
    marketing: categories.marketing,
  };
}

export function updateCustomizationDraft(
  draft: CustomizationDraft,
  category: OptionalConsentCategory,
  checked: boolean,
): CustomizationDraft {
  return { ...draft, [category]: checked };
}

export function createConsentViewModel(state: ConsentState, hydrated: boolean) {
  return {
    showBanner: hydrated && state.decision === null,
    showSettings: state.isSettingsOpen,
    bannerActions: [
      CONSENT_UI_TEXT.customize,
      CONSENT_UI_TEXT.rejectOptional,
      CONSENT_UI_TEXT.acceptAll,
    ],
    settingsActions: [CONSENT_UI_TEXT.rejectOptional, CONSENT_UI_TEXT.saveChoices],
    reopenLabel: CONSENT_UI_TEXT.reopen,
    categories: (Object.keys(categoryContent) as Array<keyof ConsentCategories>).map((key) => ({
      key,
      ...categoryContent[key],
      checked: state.categories[key],
      disabled: key === "necessary",
    })),
  };
}
