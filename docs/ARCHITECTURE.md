# Current architecture

**Status:** Active  
**Updated:** 2026-08-18

## Purpose

This repository contains the headless storefront for Spectrum Audio
Instruments. Shopify owns commerce data and checkout. The custom application
owns the storefront experience and presents Shopify-managed content.

## Runtime

- `app/` is the production application.
- Next.js App Router, React, TypeScript, and Chakra UI form the storefront.
- The application is deployed on external Next.js-compatible hosting. Shopify
  Oxygen is not part of the active architecture.
- `design-prototype/` is historical design reference. It is not deployed and is
  not an alternative application implementation.

## Commerce boundary

Shopify is the source of truth for:

- products, merchandise variants, availability, prices, and currencies;
- carts, cart lines, totals, and checkout URLs;
- checkout, payments, taxes, shipping information, and orders;
- merchant-authored store policies and shared structured content.

The storefront uses the Shopify Storefront API. Commerce-critical values must
not be reconstructed from display strings or mock data. The storefront sends
the buyer to the exact `checkoutUrl` returned by Shopify.

## Application boundaries

- Routes and UI components consume stable application types.
- `app/src/data/shopify/` owns Storefront API access and raw Shopify shapes.
- `app/src/data/mappers/` converts raw data to application types.
- `app/src/data/loaders/` selects sources and orchestrates data loading.
- `app/src/data/contents/` contains stable application-owned copy.
- `app/src/data/fallback/` contains intentional production-safe fallbacks.
- `app/src/data/mock/` is limited to mock mode and tests.

## Analytics and privacy boundary

- The existing Next.js storefront uses Shopify's framework-independent
  Hydrogen toolkit runtime; Hydrogen framework and Oxygen are not part of the
  application architecture.
- The application owns the four-category consent decision and keeps analytics,
  preferences, and marketing disabled until the visitor chooses otherwise.
- Shopify Customer Privacy is the effective second gate for Shopify Analytics.
  A missing configuration, unavailable privacy API, or failed synchronization
  fails closed without interrupting necessary commerce.
- Only page-view and product-view events are currently published. Add-to-cart
  and cart-update analytics are deliberately deferred: the toolkit's browser
  payload requires the Shopify root cart ID, which this application keeps only
  in its HttpOnly server session.
- No third-party analytics or marketing pixel is installed.

See `docs/DATA-LAYER.md` for detailed data-layer rules.

## Active delivery scope

The first production-complete milestone is a legally presentable single-product
purchase flow:

1. Shopify-backed cart and hosted Shopify checkout;
2. Shopify-managed store policies displayed in the storefront;
3. consent controls that prevent optional tracking before consent;
4. automated unit, integration, E2E, and release verification.

Product customization is deferred until the required product imagery and
configuration rules are available. It must not block the initial commerce
release.

## Decision history

- `docs/project-planning/INITIAL-PROJECT-PLAN.md` is historical.
- `docs/project-planning/001-MIGRATION-FROM-HYDROGEN-TO-NEXTJS.md` records the
  accepted migration away from Hydrogen and Oxygen.
- Future architectural decisions should be recorded as numbered ADRs under
  `docs/project-planning/`.
