# Shopify Analytics and Consent Design

**Status:** Approved  
**Date:** 2026-08-23

## Goal

Enable Shopify's own storefront analytics and Live View signals in the existing
Next.js storefront while collecting and synchronizing visitor consent. No
third-party analytics or marketing pixels are installed.

## Scope

- Keep the current Next.js App Router, Chakra UI, Storefront API, cart, and
  deployment architecture.
- Use Shopify's current framework-independent Hydrogen toolkit integration for
  Shopify analytics and customer privacy. Do not restore the historical
  Hydrogen framework or Oxygen.
- Publish page and product analytics events. Add-to-cart and cart-update events
  are deferred because the preview toolkit requires the Shopify root cart ID
  in its typed browser payload, while this storefront intentionally keeps that
  cart secret in an HttpOnly server session.
- Remove FixLoop and its storefront dependency completely.

## Consent contract

The application owns a normalized, versioned decision with four categories:

- `necessary` is always `true` and cannot be disabled.
- `analytics`, `preferences`, and `marketing` default to `false`.

Every visitor without a current decision sees the banner. The visitor can
accept all, reject all optional categories, or customize the optional
categories. A first-party cookie persists the decision for 180 days. Missing,
expired, malformed, or obsolete decisions reopen the banner and keep every
optional gate closed.

Consent is sent to Shopify's Customer Privacy API only after a visitor action.
Shopify analytics can emit only when the local analytics choice and Shopify's
effective `analyticsProcessingAllowed()` result are both true. A failed or
unavailable privacy synchronization fails closed and must not block necessary
commerce.

## UI

A client-side consent provider is mounted inside the existing Chakra provider,
without converting the server root layout or footer to client components. It
mounts one responsive banner and one controlled Chakra dialog. The footer
contains a small client button that reopens settings.

The banner exposes **Accept all**, **Reject optional**, and **Customize**. The
dialog labels every category, explains necessary storage, supports saving the
selection, traps and restores focus, closes with Escape, and uses semantic
headings and native controls.

## Analytics events

- Send an initial page view after consent and a page view after App Router path
  changes.
- Send product-view data from normalized application product data, never raw
  Shopify GraphQL responses.
- Do not publish add-to-cart or cart-update events until Shopify provides a
  typed contract that does not expose the root cart ID, or a supported
  server-side publication path becomes available. Never fabricate an ID.
- Do not emit duplicate events for React renders, failed cart requests, or
  pre-consent activity.

## Operations and validation

Deployment must provide the public Shopify storefront identity and storefront
and checkout root domains required by the current toolkit. Storefront and
checkout must share the registrable root domain for Shopify consent and
analytics cookies. Merchant validation must confirm the Headless/Hydrogen
storefront configuration and observe production-domain events in Shopify Live
View; localhost is not sufficient for final analytics validation.

The preview Customer Privacy runtime has no typed dedicated readiness
subscription. The adapter listens for the consent script load and
`visitorConsentCollected`, with a bounded five-second poll after an explicit
choice. Hydrating a persisted local decision never calls
`setTrackingConsent`; it only updates the local gate, which still requires
Shopify's already-effective privacy state to allow analytics.

Unit tests cover schema parsing, expiry/version handling, reducer transitions,
gate decisions, Shopify consent mapping, and event deduplication. Final local
verification runs `npm run lint`, `npm test`, and `npm run build` from `app/`.
