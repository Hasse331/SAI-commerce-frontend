import assert from "node:assert/strict";
import test from "node:test";

import { acceptAll, createInitialConsentState } from "@/lib/consent";
import {
  createConsentViewModel,
  createCustomizationDraft,
  updateCustomizationDraft,
} from "./consent-presentation";

const now = new Date("2026-08-23T12:00:00.000Z");

test("shows the banner only after hydration when there is no current decision", () => {
  assert.equal(createConsentViewModel(createInitialConsentState(), false).showBanner, false);
  assert.equal(createConsentViewModel(createInitialConsentState(), true).showBanner, true);
  assert.equal(
    createConsentViewModel(acceptAll(createInitialConsentState(), now), true).showBanner,
    false,
  );
});

test("opens settings independently of whether a decision exists", () => {
  const initial = createInitialConsentState();
  assert.equal(createConsentViewModel(initial, true).showSettings, false);
  assert.equal(
    createConsentViewModel({ ...initial, isSettingsOpen: true }, true).showSettings,
    true,
  );
});

test("customization starts from the current categories", () => {
  const state = acceptAll(createInitialConsentState(), now);
  assert.deepEqual(createCustomizationDraft(state.categories), {
    analytics: true,
    preferences: true,
    marketing: true,
  });
});

test("updates optional customization without exposing a necessary toggle", () => {
  const draft = createCustomizationDraft(createInitialConsentState().categories);
  assert.deepEqual(updateCustomizationDraft(draft, "analytics", true), {
    analytics: true,
    preferences: false,
    marketing: false,
  });
  assert.deepEqual(Object.keys(draft), ["analytics", "preferences", "marketing"]);
});

test("presents necessary storage as always enabled and locked", () => {
  const view = createConsentViewModel(createInitialConsentState(), true);
  const necessary = view.categories[0];
  assert.deepEqual(necessary, {
    key: "necessary",
    label: "Necessary",
    description: "Required for core storefront features such as cart and consent storage.",
    checked: true,
    disabled: true,
  });
  assert.deepEqual(view.bannerActions, ["Customize", "Reject optional", "Accept all"]);
  assert.deepEqual(view.settingsActions, ["Reject optional", "Save choices"]);
  assert.equal(view.reopenLabel, "Cookie settings");
});
