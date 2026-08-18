# Product backlog

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

