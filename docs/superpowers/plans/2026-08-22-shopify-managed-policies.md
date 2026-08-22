# Shopify-managed policies implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Use test-first development and atomic commits.

**Goal:** Publish merchant-maintained Shopify policies safely on the headless storefront and link them from the footer and purchase flow.

**Architecture:** Shopify Storefront API 2026-01 is the only policy-content source. Raw Shopify shapes stay under `data/shopify`, mappers create stable application policy types, loaders orchestrate source selection, and server-rendered routes/components consume only those types. Shopify policy HTML is sanitized on the server before rendering; missing policies produce neither mock copy nor broken links.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Chakra UI 3, Shopify Storefront GraphQL API 2026-01, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-18-commerce-mvp-design.md`

## Global constraints

- Use `SHOPIFY_STOREFRONT_API_VERSION=2026-01` and validate the GraphQL query against that schema.
- Query only `shop.privacyPolicy`, `shop.refundPolicy`, `shop.shippingPolicy`, and `shop.termsOfService` with `title`, `body`, `handle`, and `url`.
- Shopify is the only source of policy content in Shopify mode; never invent, mock, or fall back to legal copy.
- Publish populated policies at `/policies/[handle]`; use application URLs in storefront links, never Shopify Online Store policy URLs.
- Sanitize policy HTML on the server with an explicit allowlist before rendering it.
- Preserve the exact Shopify-hosted `checkoutUrl` handoff.
- Do not modify the user's existing `docs/BACKLOG.md` change.
- Stage explicit paths and create one independently revertible Conventional Commit per task.

---

### Task 1: Policy data contract and safe content

**Files:**

- Create: `app/src/types/policies.ts`
- Create: `app/src/data/shopify/policies.ts`
- Create: `app/src/data/shopify/policies.test.ts`
- Create: `app/src/data/mappers/policies.ts`
- Create: `app/src/data/mappers/policies.test.ts`
- Create: `app/src/data/loaders/policies.ts`
- Create: `app/src/data/loaders/policies.test.ts`
- Create: `app/src/lib/policies/sanitize-policy-html.ts`
- Create: `app/src/lib/policies/sanitize-policy-html.test.ts`
- Modify: `app/src/data/mappers/index.ts`
- Modify only if required by the sanitizer: `app/package.json`, `app/package-lock.json`

**Produces:**

- `StorePolicy { handle: string; title: string; bodyHtml: string; href: string }`
- `getStorePolicies(): Promise<StorePolicy[]>`
- `getStorePolicy(handle: string): Promise<StorePolicy | undefined>`

**Acceptance:**

- Tests first prove the GraphQL selection, fixed policy order, null/blank omission, stable `/policies/<handle>` links, mock-mode empty result, safe lookup, and removal of scripts, event attributes, unsafe URLs and unsupported elements.
- Allowed headings, paragraphs, lists, emphasis and safe links remain readable.
- Shopify/API failures remain errors and are not converted to fabricated content.
- Run the narrow tests, then `npm test`.
- Commit: `feat(policies): add Shopify policy data contract`

### Task 2: Routes, storefront links, and merchant operations

**Files:**

- Create: `app/src/app/policies/[handle]/page.tsx`
- Create: focused pure presentation helpers/tests where the existing Node test setup requires them
- Modify: `app/src/app/sitemap.ts`
- Modify: `app/src/data/loaders/footer.ts`
- Modify: `app/src/data/mappers/footer.ts`
- Modify: `app/src/data/mappers/footer.test.ts` if present, otherwise create it
- Modify: `app/src/components/cart/checkout-button.tsx`
- Modify: `app/src/components/cart/checkout-button.test.ts`
- Modify the narrowest existing cart provider/content boundary needed to pass `PolicyLink[]` to both cart presentations
- Modify: `docs/SHOPIFY-COMMERCE-SETUP.md`

**Consumes:** `StorePolicy`, `getStorePolicies`, and `getStorePolicy` from Task 1.

**Acceptance:**

- The server route awaits Next.js 16 `params`, renders one semantic policy article, generates policy metadata/canonical URL, and calls `notFound()` for unknown or missing handles.
- Footer adds a Policies group only when at least one policy exists.
- The cart shows the same available policy links immediately before checkout without altering checkout URL validation or navigation.
- Sitemap includes only available policy URLs.
- Merchant documentation explains Settings → Policies, the 60-second content-cache delay, Preview/UAT verification, hosted-checkout policy verification, and merchant ownership of legal review.
- Documentation uses API version `2026-01` and no longer calls policies out of scope.
- Tests are written and observed failing before implementation.
- Run narrow tests, then `npm run lint`, `npm test`, and `npm run build`.
- Commit UI and documentation separately when they are independently revertible:
  - `feat(policies): publish policies in the storefront`
  - `docs(shopify): document policy publishing`

### Task 3: Independent final review

- Review every commit against this plan and the approved MVP spec.
- Confirm no raw Shopify response enters UI, no unsanitized HTML is rendered, no mock legal fallback exists, and cart/checkout behavior is unchanged.
- Resolve Important/Critical findings through the original implementer and a scoped re-review.
- Run final `npm run lint`, `npm test`, and `npm run build` from `app/`.
- Record remaining merchant actions without credentials, buyer data, cart IDs, or checkout URLs.
