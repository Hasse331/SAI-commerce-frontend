# Spectrum Audio Instruments Frontend / StoreFront

Made on top of hydrogen template skeleton:

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

## What's included - project stack:

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript
- Minimal setup of components and routes
- \+ Chakra UI

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

To run the dev server you need .shopify/project.json secrets, which includes you shopify shop/backend information. You can do this by linking your Shopify account or alternatively you can use mock.shop.

Read more from:
https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started#step-3-link-your-hydrogen-project-to-shopify

```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>

## Relevant docs:

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)
https://reactrouter.com/start/declarative/routing
https://chakra-ui.com/docs
https://www.npmjs.com/package/next-themes
