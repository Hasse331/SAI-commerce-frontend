import assert from "node:assert/strict";
import test from "node:test";

import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  acceptAll,
  canUseConsentCategory,
  createInitialConsentState,
  customizeConsent,
  parseConsentCookie,
  rejectOptional,
  reopenConsent,
  serializeConsentCookie,
} from "./index";

const now = new Date("2026-08-23T12:00:00.000Z");

test("initial consent fails closed and has no persisted decision", () => {
  assert.deepEqual(createInitialConsentState(), {
    decision: null,
    isSettingsOpen: false,
    categories: {
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
    },
  });
});

test("accept all grants every category and creates a 180-day decision", () => {
  const state = acceptAll(createInitialConsentState(), now);

  assert.deepEqual(state.categories, {
    necessary: true,
    analytics: true,
    preferences: true,
    marketing: true,
  });
  assert.equal(state.decision?.version, CONSENT_VERSION);
  assert.equal(state.decision?.decidedAt, "2026-08-23T12:00:00.000Z");
  assert.equal(state.decision?.expiresAt, "2027-02-19T12:00:00.000Z");
});

test("reject optional disables every optional category", () => {
  const state = rejectOptional(acceptAll(createInitialConsentState(), now), now);

  assert.equal(state.categories.necessary, true);
  assert.equal(state.categories.analytics, false);
  assert.equal(state.categories.preferences, false);
  assert.equal(state.categories.marketing, false);
});

test("customize saves only requested optional categories and cannot disable necessary", () => {
  const untrustedCategories = {
    necessary: false,
    analytics: true,
    preferences: false,
    marketing: true,
  } as unknown as Parameters<typeof customizeConsent>[1];
  const state = customizeConsent(
    createInitialConsentState(),
    untrustedCategories,
    now,
  );

  assert.deepEqual(state.categories, {
    necessary: true,
    analytics: true,
    preferences: false,
    marketing: true,
  });
  assert.equal(state.isSettingsOpen, false);
});

test("reopen opens settings without changing the saved decision", () => {
  const accepted = acceptAll(createInitialConsentState(), now);
  const reopened = reopenConsent(accepted);

  assert.equal(reopened.isSettingsOpen, true);
  assert.deepEqual(reopened.decision, accepted.decision);
});

test("cookie serialization uses a first-party 180-day cookie", () => {
  const decision = acceptAll(createInitialConsentState(), now).decision!;
  const cookie = serializeConsentCookie(decision);

  assert.match(cookie, /^sai_consent=/);
  assert.match(cookie, /Max-Age=15552000/);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(cookie, /Domain=/);
  assert.equal(CONSENT_COOKIE_MAX_AGE_SECONDS, 15_552_000);
});

test("cookie parser restores a current decision", () => {
  const decision = acceptAll(createInitialConsentState(), now).decision!;
  const cookieHeader = `session=x; ${serializeConsentCookie(decision).split(";")[0]}; theme=dark`;

  assert.deepEqual(parseConsentCookie(cookieHeader, new Date("2026-08-24T00:00:00.000Z")), decision);
});

test("missing, malformed, wrong-version, and expired cookies have no decision", () => {
  const malformed = "sai_consent=%7Bbad";
  const wrongVersion = encodeURIComponent(JSON.stringify({
    version: CONSENT_VERSION + 1,
    decidedAt: now.toISOString(),
    expiresAt: "2027-02-19T12:00:00.000Z",
    categories: { necessary: true, analytics: true, preferences: true, marketing: true },
  }));
  const expired = serializeConsentCookie(acceptAll(createInitialConsentState(), now).decision!).split(";")[0];

  assert.equal(parseConsentCookie(undefined, now), null);
  assert.equal(parseConsentCookie(malformed, now), null);
  assert.equal(parseConsentCookie(`sai_consent=${wrongVersion}`, now), null);
  assert.equal(parseConsentCookie(expired, new Date("2027-02-19T12:00:00.001Z")), null);
});

test("future-dated decisions and decisions lasting more than 180 days are rejected", () => {
  const categories = { necessary: true, analytics: true, preferences: false, marketing: false };
  const futureDated = encodeURIComponent(JSON.stringify({
    version: CONSENT_VERSION,
    decidedAt: "2026-08-23T12:00:00.001Z",
    expiresAt: "2027-02-19T12:00:00.001Z",
    categories,
  }));
  const overlong = encodeURIComponent(JSON.stringify({
    version: CONSENT_VERSION,
    decidedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-02-19T12:00:00.001Z",
    categories,
  }));

  assert.equal(parseConsentCookie(`sai_consent=${futureDated}`, now), null);
  assert.equal(parseConsentCookie(`sai_consent=${overlong}`, now), null);
});

test("decisions with disabled necessary or nonboolean optional categories are rejected", () => {
  const base = {
    version: CONSENT_VERSION,
    decidedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-02-19T12:00:00.000Z",
  };
  const disabledNecessary = encodeURIComponent(JSON.stringify({
    ...base,
    categories: { necessary: false, analytics: false, preferences: false, marketing: false },
  }));
  const nonbooleanAnalytics = encodeURIComponent(JSON.stringify({
    ...base,
    categories: { necessary: true, analytics: "yes", preferences: false, marketing: false },
  }));

  assert.equal(parseConsentCookie(`sai_consent=${disabledNecessary}`, now), null);
  assert.equal(parseConsentCookie(`sai_consent=${nonbooleanAnalytics}`, now), null);
});

test("category gates always allow necessary and require a current grant for optional use", () => {
  const accepted = acceptAll(createInitialConsentState(), now).decision;

  assert.equal(canUseConsentCategory(null, "necessary", now), true);
  assert.equal(canUseConsentCategory(null, "analytics", now), false);
  assert.equal(canUseConsentCategory(accepted, "analytics", now), true);
  assert.equal(canUseConsentCategory(accepted, "analytics", new Date("2027-02-19T12:00:00.001Z")), false);
});
