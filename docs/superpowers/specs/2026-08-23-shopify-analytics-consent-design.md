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
- Publish page, product, add-to-cart, and cart-update analytics events.
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
- Send add-to-cart and cart-update data from successful normalized cart state
  transitions only.
- Do not emit duplicate events for React renders, failed cart requests, or
  pre-consent activity.

## Operations and validation

Deployment must provide the public Shopify storefront identity and storefront
and checkout root domains required by the current toolkit. Storefront and
checkout must share the registrable root domain for Shopify consent and
analytics cookies. Merchant validation must confirm the Headless/Hydrogen
storefront configuration and observe production-domain events in Shopify Live
View; localhost is not sufficient for add-to-cart validation.

Unit tests cover schema parsing, expiry/version handling, reducer transitions,
gate decisions, Shopify consent mapping, and event deduplication. Final local
verification runs `npm run lint`, `npm test`, and `npm run build` from `app/`.

