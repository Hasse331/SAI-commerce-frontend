# ADR 001: Migration from Shopify Hydrogen to Custom Next.js Stack

**Date:** 2026-03-12  
**Status:** Proposed

## Context

The project initially explored the use of Shopify Hydrogen as the storefront framework. During early implementation and experimentation with the provided Hydrogen skeleton, several architectural limitations were identified.

1. **Tight Coupling**  
   The Hydrogen skeleton structure tightly couples multiple components (header, cart, layout, routing, and data loading). This made the architecture difficult to modify without affecting unrelated parts of the system.

2. **Routing Complexity**  
   The reliance on nested routes and data loaders via React Router introduced additional complexity. Small structural changes often required changes across multiple components or routes.

3. **Styling Conflicts**  
   The default Hydrogen skeleton relies on vanilla CSS. For this project, a theme-aware component system such as Chakra UI was preferred. Mixing both approaches would introduce multiple styling systems and reduce long-term maintainability.

Given the small scale of the project and the need for a modular and maintainable architecture, the Hydrogen skeleton was considered unnecessarily complex for the intended use case.

## Decision

The project will migrate away from Shopify Hydrogen and adopt a **custom Next.js frontend architecture**.

The storefront will use:

- **Next.js**
- **TypeScript**
- **Chakra UI** for theme-aware component styling
- **Shopify Storefront API (GraphQL)** as the commerce backend

Shopify will remain the headless commerce platform, while the frontend will be fully controlled within the custom Next.js application.

## Consequences

### Positive

- **Full architectural control** over routing, layout, and component design.
- **Improved modularity** and easier long-term maintainability.
- **Single styling system** using Chakra UI with theme support.
- **Cleaner development workflow** and predictable component boundaries.
- Avoids unnecessary complexity from the Hydrogen skeleton.

### Negative / Challenges

- **Hosting limitation:** Shopify Oxygen does not support Next.js applications. The storefront must be deployed on an external platform (e.g., Vercel, AWS, or similar).
- Some utilities provided by Hydrogen (e.g., cart helpers) must be implemented manually.
- No pre-built Hydrogen UI components; all storefront components will be implemented within the custom stack.

## Alternatives Considered

### 1. Continue Using Hydrogen (Remix)

Hydrogen provides deep integration with Shopify and allows deployment via Shopify Oxygen. However, the provided skeleton introduced tight coupling and architectural complexity that made it difficult to adapt for a minimal custom storefront.

### 2. Custom Remix Implementation (without Hydrogen)

Another option would have been building a custom Remix application without using the Hydrogen skeleton. While this would allow deployment to Oxygen, it would still introduce additional framework conventions and complexity compared to the desired minimal architecture.

## Notes

This decision prioritizes **simplicity, maintainability, and architectural control** for a small project primarily maintained by a single developer.

---

_This document follows the Architecture Decision Record (ADR) pattern to maintain transparency and historical context for architectural decisions within the project._
