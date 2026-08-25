import assert from "node:assert/strict";
import test from "node:test";
import type { ConsentDecision } from "@/lib/consent";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_PERSISTENCE_FAILURE_EVENT,
  announceConsentDecision,
  announceConsentPersistenceFailure,
  announceHydratedConsent,
  announceProductView,
  clearProductView,
  getLatestHydratedConsent,
  getLatestProductView,
} from "./events.ts";

test("leaving a product clears the cached product before later consent", () => {
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", { configurable: true, value: new EventTarget() });
  try {
    announceProductView({ productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/2", title: "SAI", price: "10.00", vendor: "SAI", variantTitle: "Default", quantity: 1, sku: null });
    assert.notEqual(getLatestProductView(), null);
    clearProductView();
    assert.equal(getLatestProductView(), null);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
});

test("a persisted grant announced before runtime mount remains available without synchronization", () => {
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: new EventTarget(),
  });
  const decision: ConsentDecision = {
    version: 1,
    decidedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-02-19T12:00:00.000Z",
    categories: { necessary: true, analytics: true, preferences: false, marketing: false },
  };

  try {
    announceHydratedConsent(decision);
    assert.equal(getLatestHydratedConsent(), decision);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
});

test("an explicit rejection replaces an older hydrated grant for later effect initialization", () => {
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: new EventTarget(),
  });
  const granted: ConsentDecision = {
    version: 1,
    decidedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-02-19T12:00:00.000Z",
    categories: { necessary: true, analytics: true, preferences: false, marketing: false },
  };
  const rejected: ConsentDecision = {
    ...granted,
    decidedAt: "2026-08-23T12:01:00.000Z",
    categories: { ...granted.categories, analytics: false },
  };

  try {
    announceHydratedConsent(granted);
    announceConsentDecision(rejected);
    assert.equal(getLatestHydratedConsent()?.categories.analytics, false);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
});

test("persistence failure revokes a cached grant for later runtime initialization without an explicit sync event", () => {
  const previousWindow = globalThis.window;
  const eventTarget = new EventTarget();
  Object.defineProperty(globalThis, "window", { configurable: true, value: eventTarget });
  const granted: ConsentDecision = {
    version: 1,
    decidedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-02-19T12:00:00.000Z",
    categories: { necessary: true, analytics: true, preferences: false, marketing: false },
  };
  let explicitEvents = 0;
  let failureEvents = 0;
  eventTarget.addEventListener(CONSENT_CHANGED_EVENT, () => { explicitEvents += 1; });
  eventTarget.addEventListener(CONSENT_PERSISTENCE_FAILURE_EVENT, () => { failureEvents += 1; });

  try {
    announceHydratedConsent(granted);
    announceConsentPersistenceFailure();
    assert.equal(getLatestHydratedConsent(), null);
    assert.equal(explicitEvents, 0);
    assert.equal(failureEvents, 1);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
});
