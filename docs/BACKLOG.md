# Product backlog

## Merchant content: product image specifications

The storefront renders horizontal and vertical image specification sections
when Shopify provides an image plus matching title and text lists. The current
`product_details_page` entries need merchant-side content before these sections
can appear:

- Add an `image_specs_horizontal` metaobject reference where the horizontal
  section is wanted.
- Populate `large_image`, `specs_titles`, and `specs_text` on each referenced
  image-spec metaobject.
- Keep `specs_titles` and `specs_text` the same length so every heading has a
  description.

Do not use mock content as a Shopify fallback for these sections.

## Deferred: testing and automation

- Add Storefront API integration tests around the existing diagnostic scripts.
- Add end-to-end coverage for the main storefront journeys.
- Run unit, integration, and end-to-end checks in the main GitHub workflow.

## Deferred: documentation

- Add focused project structure, data model, API, testing, and getting-started
  guides where `ARCHITECTURE.md`, `DATA-LAYER.md`, and the root README do not
  already cover the subject.

## Deferred: analytics and consent

- Define the Shopify analytics integration boundary.
- Add cookie consent choices and privacy controls before enabling optional
  analytics.

## Deferred: product customization

**Status:** Archived until prerequisites are available  
**Not part of:** Initial commerce MVP

The existing development-only customization component and mock data are kept as
design exploration. They must remain disabled in production and must not be
connected to pricing or checkout until a separate design is approved.

### Prerequisites for reactivation

- Product photography or render layers for every supported visible option.
- Merchant-approved list of configurable attributes and allowed combinations.
- Decision on which choices are Shopify variants and which are cart-line
  attributes.
- Pricing and availability rules for every purchasable configuration.
- Behaviour for invalid, unavailable, and discontinued combinations.
- Mobile and desktop interaction design.

### Intended future work

1. Design the configuration data model and Shopify ownership boundary.
2. Select an image strategy: prepared combination images or composited layers.
3. Build a configuration state model independent of presentation.
4. Connect the result to Shopify merchandise and cart-line attributes.
5. Add pricing, accessibility, integration, and E2E coverage.

## Deferred: product sound demos

- Use MP3 as the initial supported format.
- Keep guitar and microphone recording details as text.
- Present clean and overdrive recordings of the same performance rather than a
  genre taxonomy.
