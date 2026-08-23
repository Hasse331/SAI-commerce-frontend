# Shopify Analytics and Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent-gated Shopify analytics and accessible consent controls to the existing Next.js storefront.

**Architecture:** An app-owned consent domain persists a fail-closed decision and exposes stable React context. A Shopify-specific client adapter synchronizes that decision and publishes normalized storefront events through Shopify's current framework-independent Hydrogen toolkit.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Chakra UI 3, Shopify Hydrogen toolkit, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-23-shopify-analytics-consent-design.md`

## Global Constraints

- Do not add third-party analytics or marketing pixels.
- Do not restore the historical Hydrogen framework or Oxygen.
- Necessary storage is always enabled; optional processing defaults disabled.
- Never emit Shopify analytics before effective analytics consent.
- Preserve the user's existing `docs/BACKLOG.md` change.
- Stage explicit paths and create one Conventional Commit per task.

---

### Task 1: Remove FixLoop

**Files:** `app/src/app/layout.tsx`, `app/src/components/layout/footer.tsx`, `app/package.json`, `app/package-lock.json`, and obsolete FixLoop-only source/tests.

- [ ] Remove the provider, modal, footer trigger, environment parser, and dependency.
- [ ] Run the affected unit suite, lint, and build.
- [ ] Commit `chore(storefront): remove fixloop integration`.

### Task 2: Consent domain and persistence

**Files:** create focused files under `app/src/lib/consent/` with colocated tests.

- [ ] Write failing tests for defaults, choices, serialization, malformed data, version mismatch, and 180-day expiry.
- [ ] Implement immutable consent types, reducer, cookie parser/serializer, and optional-script gate decisions.
- [ ] Run the focused tests and full unit suite.
- [ ] Commit `feat(consent): add persistent consent domain`.

### Task 3: Shopify privacy and analytics adapter

**Files:** Shopify integration files under `app/src/data/shopify/analytics/`, root analytics bridge, configuration, manifest, lockfile, and focused tests.

- [ ] Lock the current Shopify toolkit preview package compatible with React 19 and Next.js.
- [ ] Write failing tests for consent mapping, fail-closed readiness, supported event mapping, and deduplication.
- [ ] Implement Customer Privacy synchronization and consent-gated page, product, add-to-cart, and cart-update publishing.
- [ ] Add only the public storefront identity/domain configuration required by Shopify and document runtime validation limits.
- [ ] Run focused tests, full unit tests, lint, and build.
- [ ] Commit `feat(analytics): add consent-gated shopify analytics`.

### Task 4: Accessible consent controls

**Files:** focused components under `app/src/components/consent/`, root layout/provider composition, footer launcher, content constants, and presentation tests.

- [ ] Write failing state/presentation tests for banner visibility, all actions, customization, save, reopen, and necessary-category locking.
- [ ] Implement the responsive banner, controlled Chakra v3 dialog, and footer settings button.
- [ ] Wire the consent and analytics providers without converting the server layout or footer to client components.
- [ ] Run focused tests, full unit tests, lint, and build.
- [ ] Commit `feat(consent): add accessible privacy controls`.

### Task 5: Merchant documentation and release verification

**Files:** `README.md`, `docs/SHOPIFY-COMMERCE-SETUP.md`, and Phase 3 roadmap/status documentation.

- [ ] Document environment values, domains, Shopify Admin configuration, consent checks, Live View validation, and rollback.
- [ ] Run `npm run lint`, `npm test`, and `npm run build` from `app/`.
- [ ] Inspect the complete diff and commit only documentation as `docs: add shopify analytics release guide`.

