# Commerce MVP delivery roadmap

> This roadmap decomposes the approved MVP into independently designed and
> testable subsystems. Each implementation phase receives its own detailed plan
> before code changes begin.

**Goal:** Deliver a purchasable and legally presentable storefront while
keeping product customization explicitly deferred.

**Spec:** `docs/superpowers/specs/2026-08-18-commerce-mvp-design.md`

## Phase 1: Shopify cart and checkout

Detailed plan:
`docs/superpowers/plans/2026-08-18-shopify-cart-checkout.md`

Deliverables:

- Default Shopify merchandise ID is available to the product UI.
- Server-owned persistent Shopify cart.
- Add, update, remove, reload, and checkout operations.
- Functional cart sidebar and `/cart` page.
- Unit and integration coverage for every commerce boundary.

Suggested context allocation:

- Shopify/data agent for merchandise data and Cart API.
- Storefront agent for the cart client state and user interface after the
  normalized cart contract is accepted.
- Quality review scoped to the cart contract and checkout handoff.

## Phase 2: Shopify-managed policies

Create a detailed policy plan after Phase 1 is accepted.

Deliverables:

- Native `ShopPolicy` query, types, mapper, and loader.
- `/policies/[handle]` pages for every populated Shopify policy.
- Footer and pre-checkout policy links.
- Safe rendering and missing-policy behaviour.
- Merchant instructions for **Settings > Policies**.

Primary context: compliance/data agent. Storefront work is limited to the
policy route and link presentation.

## Phase 3: Consent controls

**Status (2026-08-23):** Implemented in the working tree. Local lint and tests
can be completed locally; the production build's network-dependent validation
and production-domain Shopify Live View acceptance remain release gates.

Create a detailed consent plan after the active analytics/pixel inventory is
confirmed.

Deliverables:

- Necessary, analytics, preferences, and marketing consent model.
- Accept, reject, customize, persist, and reopen interactions.
- Optional-script gates that default to disabled.
- Shopify-supported customer privacy synchronization.
- Accessible banner and settings dialog.

Primary context: compliance agent. A storefront agent may own the dialog UI
against an accepted consent interface.

Implemented scope publishes consent-gated Shopify page-view and product-view
events only. Cart and add-to-cart events remain deferred because publishing
them through the current browser toolkit would expose the root Shopify cart ID
and violate the HttpOnly cart-session boundary.

## Phase 4: Release verification and thicker tests

Create a detailed quality plan after Phases 1-3 expose stable user flows.

Deliverables:

- Cross-platform repository test command.
- Unit and route-integration suites in CI.
- Playwright purchase-handoff, policy, and consent journeys.
- Real-Shopify smoke test that does not mutate production unintentionally.
- Accessibility, responsive, and browser verification.
- Merchant release checklist and documented rollback check.

Primary context: quality agent with read-only access to feature contracts and
write access limited to tests, fixtures, CI, and necessary test hooks.

## Phase 5: Archived customization

No implementation begins in the commerce MVP. Keep the production feature
disabled and preserve the requirements in `docs/BACKLOG.md`. Create a new
design and plan only after the merchant supplies the required imagery,
configuration rules, availability rules, and pricing ownership.
