# Shopify Cart and Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-memory preview cart with a persistent Shopify cart and hand buyers to Shopify hosted checkout.

**Architecture:** Product loaders expose Shopify's default merchandise variant ID. Server-only cart functions normalize Storefront API responses into application cart types, while same-origin Next.js route handlers own the HTTP-only cart cookie. Client components consume only the normalized cart HTTP contract and redirect to Shopify's returned `checkoutUrl`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Chakra UI 3, Shopify Storefront GraphQL API, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-18-commerce-mvp-design.md`

## Global Constraints

- Shopify is the source of truth for merchandise ID, availability, line prices, totals, currency, and checkout URL.
- The MVP purchases the first/default Shopify variant and does not present variant selection.
- Store the Shopify cart ID only in an HTTP-only, same-site `sai_cart_id` cookie.
- Never expose a private Shopify token, log a cart ID, or construct a checkout URL.
- Raw GraphQL response types stay below `app/src/data/shopify/`; UI consumes `app/src/types/cart.ts`.
- Mock product data may contain deterministic fake merchandise IDs for rendering and tests, but Shopify mode never falls back to them.
- Every task ends in one independently reviewable atomic commit and follows the root `AGENTS.md`.

---

### Task 1: Cross-platform unit test command

**Context owner:** Quality/tooling agent. Read only `app/package.json`, `app/package-lock.json`, current `*.test.ts` files, and CI Node version.

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`

**Interfaces:**
- Consumes: existing tests written with `node:test`
- Produces: `npm test` and `npm run test:unit` commands usable on Node 20 and Windows/Linux

- [ ] **Step 1: Install the TypeScript test launcher**

Run from `app/`:

```powershell
npm install --save-dev tsx@4.20.5
```

- [ ] **Step 2: Add test scripts**

Add these entries to `scripts` in `app/package.json`:

```json
"test": "npm run test:unit",
"test:unit": "tsx --test \"src/**/*.test.ts\""
```

- [ ] **Step 3: Run the existing suite through the new contract**

Run: `npm test`  
Expected: 22 existing tests pass and the command exits 0 without Node's TypeScript module warning.

- [ ] **Step 4: Verify lint after the package change**

Run: `npm run lint`  
Expected: exit 0.

- [ ] **Step 5: Commit the test command**

```powershell
git add app/package.json app/package-lock.json
git commit -m "test: add cross-platform unit test command"
```

---

### Task 2: Purchasable default merchandise in product data

**Context owner:** Shopify/data agent. Read only product domain types, product Shopify query shapes, product mappers/loaders, and product mock fixtures.

**Files:**
- Modify: `app/src/types/products.ts`
- Modify: `app/src/types/shopify.ts`
- Modify: `app/src/data/loaders/product-detail-page.ts`
- Modify: `app/src/data/mappers/product-primitives.ts`
- Create: `app/src/data/mappers/product-primitives.test.ts`
- Modify: `app/src/data/mock/products/product-basic.ts`

**Interfaces:**
- Consumes: Shopify `Product.variants(first: 1)` nodes
- Produces: `ProductSummary.merchandiseId?: string`; the value is present only when a purchasable default variant exists

- [ ] **Step 1: Write failing mapper tests**

Create `product-primitives.test.ts` with fixtures that assert:

```ts
test("maps the first available variant as purchasable merchandise", () => {
  const product = makeShopifyProduct({
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          availableForSale: true,
        },
      ],
    },
  });

  assert.equal(
    mapStorefrontProductToListItem(product).merchandiseId,
    "gid://shopify/ProductVariant/101",
  );
});

test("omits merchandise when the default variant is unavailable", () => {
  const product = makeShopifyProduct({
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          availableForSale: false,
        },
      ],
    },
  });

  assert.equal(mapStorefrontProductToListItem(product).merchandiseId, undefined);
});
```

The local `makeShopifyProduct` fixture must return every required
`ShopifyProductNode` field with inert values so the test has no network or mock
module dependency.

- [ ] **Step 2: Verify the tests fail for the missing contract**

Run: `npm run test:unit -- src/data/mappers/product-primitives.test.ts`  
Expected: FAIL because `merchandiseId` and `variants` are not defined.

- [ ] **Step 3: Add the domain and raw Shopify fields**

Add to `ProductSummary`:

```ts
merchandiseId?: string;
```

Add to `ShopifyProductNode`:

```ts
variants: {
  nodes: Array<{
    id: string;
    availableForSale: boolean;
  }>;
};
```

- [ ] **Step 4: Query and map the default variant**

Add this product selection to `productDetailPagesQuery`:

```graphql
variants(first: 1) {
  nodes {
    id
    availableForSale
  }
}
```

Map only an available node:

```ts
const defaultVariant = product.variants.nodes.find(
  (variant) => variant.availableForSale,
);

return {
  merchandiseId: defaultVariant?.id,
  // existing mapped fields
};
```

- [ ] **Step 5: Keep mock product shapes compatible**

Give each `productBasicDataBySlug` item a deterministic value with this form:

```ts
merchandiseId: "gid://shopify/ProductVariant/mock-<existing-slug>",
```

Do not import mock values into Shopify loaders or mappers.

- [ ] **Step 6: Run mapper and full unit suites**

Run: `npm run test:unit -- src/data/mappers/product-primitives.test.ts`  
Expected: the two new tests pass.

Run: `npm test`  
Expected: all old and new tests pass.

- [ ] **Step 7: Commit the merchandise contract**

```powershell
git add app/src/types/products.ts app/src/types/shopify.ts app/src/data/loaders/product-detail-page.ts app/src/data/mappers/product-primitives.ts app/src/data/mappers/product-primitives.test.ts app/src/data/mock/products/product-basic.ts
git commit -m "feat(products): expose default Shopify merchandise"
```

---

### Task 3: Normalized Shopify cart data layer

**Context owner:** Shopify/data agent. Keep the Task 2 product contract, then read only the Storefront client and new cart-specific files.

**Files:**
- Create: `app/src/types/cart.ts`
- Create: `app/src/data/shopify/cart/types.ts`
- Create: `app/src/data/shopify/cart/mapper.ts`
- Create: `app/src/data/shopify/cart/mapper.test.ts`
- Create: `app/src/data/shopify/cart/operations.ts`
- Create: `app/src/data/shopify/cart/operations.test.ts`

**Interfaces:**
- Consumes: `storefrontQuery<TData>(query, variables)`
- Produces:
  - `getCart(cartId: string): Promise<Cart | null>`
  - `createCart(merchandiseId: string, quantity: number): Promise<Cart>`
  - `addCartLine(cartId: string, merchandiseId: string, quantity: number): Promise<Cart>`
  - `updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart>`
  - `removeCartLine(cartId: string, lineId: string): Promise<Cart>`
  - `CartOperationError` with normalized `code` and safe `message`

- [ ] **Step 1: Define the application cart contract**

Create `app/src/types/cart.ts`:

```ts
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartLine {
  id: string;
  merchandiseId: string;
  quantity: number;
  title: string;
  slug: string;
  image: { src: string; alt: string } | null;
  unitPrice: Money;
  totalPrice: Money;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
}
```

- [ ] **Step 2: Write failing raw-response mapper tests**

Cover all of these exact cases in `mapper.test.ts`:

- a populated cart maps line ID, variant ID, product handle/title, image,
  quantity, unit price, line total, subtotal, total, and checkout URL;
- a missing image maps to `null`;
- an empty Shopify connection maps to `lines: []`;
- the mapper preserves money amounts as strings.

Run: `npm run test:unit -- src/data/shopify/cart/mapper.test.ts`  
Expected: FAIL because the mapper does not exist.

- [ ] **Step 3: Implement raw cart types and mapper**

Keep GraphQL-only connection and payload types in `cart/types.ts`. Export from
`cart/mapper.ts`:

```ts
export function mapShopifyCart(cart: ShopifyCart): Cart;
```

Use `variant.product.handle` for `slug`, `variant.product.title` for `title`,
and `variant.image` for the optional cart image.

- [ ] **Step 4: Verify mapper tests pass**

Run: `npm run test:unit -- src/data/shopify/cart/mapper.test.ts`  
Expected: all mapper cases pass.

- [ ] **Step 5: Write failing operation tests with an injected request function**

Design `createCartOperations` for deterministic tests:

```ts
export function createCartOperations(request: StorefrontRequest) {
  return { getCart, createCart, addCartLine, updateCartLine, removeCartLine };
}
```

Tests must assert:

- every function sends the exact required variables;
- `getCart` returns `null` when Shopify returns `cart: null`;
- mutations return the normalized payload cart;
- a mutation with `userErrors` throws `CartOperationError` using the first safe
  code and message;
- a mutation without a cart and without user errors throws code
  `MISSING_CART_RESPONSE`.

Run: `npm run test:unit -- src/data/shopify/cart/operations.test.ts`  
Expected: FAIL because operations do not exist.

- [ ] **Step 6: Implement Storefront cart queries and mutations**

Each cart selection must request:

```graphql
id
checkoutUrl
totalQuantity
cost {
  subtotalAmount { amount currencyCode }
  totalAmount { amount currencyCode }
}
lines(first: 100) {
  nodes {
    id
    quantity
    cost { totalAmount { amount currencyCode } }
    merchandise {
      ... on ProductVariant {
        id
        price { amount currencyCode }
        image { url altText }
        product { handle title }
      }
    }
  }
}
```

Use `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, and `cartLinesRemove` with
their documented input variables. Export production functions created with
the existing `storefrontQuery` after exporting the injectable factory for
tests.

- [ ] **Step 7: Run cart data tests and lint**

Run: `npm run test:unit -- src/data/shopify/cart/*.test.ts`  
Expected: mapper and operation tests pass.

Run: `npm run lint`  
Expected: exit 0.

- [ ] **Step 8: Commit the Shopify cart boundary**

```powershell
git add app/src/types/cart.ts app/src/data/shopify/cart
git commit -m "feat(cart): add Shopify cart data layer"
```

---

### Task 4: HTTP-only cart session and same-origin endpoints

**Context owner:** Shopify/server agent. Read the Task 3 public functions, Next cookies API, and only the new cart route/helper files.

**Files:**
- Create: `app/src/lib/cart/cart-cookie.ts`
- Create: `app/src/lib/cart/cart-cookie.test.ts`
- Create: `app/src/lib/cart/cart-response.ts`
- Create: `app/src/app/api/cart/route.ts`
- Create: `app/src/app/api/cart/route.test.ts`
- Create: `app/src/app/api/cart/lines/route.ts`
- Create: `app/src/app/api/cart/lines/route.test.ts`

**Interfaces:**
- Consumes: Task 3 cart functions and `Cart`
- Produces HTTP JSON:
  - `GET /api/cart` -> `{ cart: Cart | null }`
  - `POST /api/cart` body `{ merchandiseId: string; quantity: number }`
  - `PATCH /api/cart/lines` body `{ lineId: string; quantity: number }`
  - `DELETE /api/cart/lines` body `{ lineId: string }`

- [ ] **Step 1: Write failing cookie option tests**

The cookie helper must produce:

```ts
{
  name: "sai_cart_id",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
}
```

Test both production and development `secure` values without mutating other
environment variables.

Run: `npm run test:unit -- src/lib/cart/cart-cookie.test.ts`  
Expected: FAIL because the helper does not exist.

- [ ] **Step 2: Implement cart cookie helpers**

Export the cookie name, options factory, and functions to set/delete the cookie
on a `NextResponse`. Never log or return the cart ID.

- [ ] **Step 3: Write failing GET and POST route tests**

Refactor route logic into exported dependency-injected handlers while keeping
Next's `GET` and `POST` exports as thin adapters. Cover:

- GET without a cookie returns 200 and `{ cart: null }`;
- GET with a valid cookie returns the normalized cart;
- GET with an expired Shopify cart returns `{ cart: null }` and deletes cookie;
- POST rejects blank merchandise ID, non-integer quantity, quantity below 1,
  and quantity above 99 with status 400;
- POST without a cart creates one and sets the cookie;
- POST with an existing cart adds a line;
- POST whose stored cart no longer exists creates a new cart and replaces the
  cookie;
- Shopify user errors return a safe 422 response without GraphQL internals.

Run: `npm run test:unit -- src/app/api/cart/route.test.ts`  
Expected: FAIL because route handlers do not exist.

- [ ] **Step 4: Implement GET and POST**

Return only these error shapes:

```ts
{ error: { code: "INVALID_CART_INPUT", message: string } }
{ error: { code: "CART_OPERATION_FAILED", message: string } }
```

Do not include stack traces, Shopify cart IDs, queries, variables, or tokens.

- [ ] **Step 5: Write failing PATCH and DELETE route tests**

Cover:

- missing cart cookie returns 409 `CART_SESSION_MISSING`;
- PATCH validates line ID and integer quantity 1..99;
- PATCH returns the updated normalized cart;
- DELETE validates line ID and returns the updated normalized cart;
- missing Shopify cart clears the cookie and returns 409
  `CART_SESSION_EXPIRED`;
- Shopify mutation errors return a safe 422.

Run: `npm run test:unit -- src/app/api/cart/lines/route.test.ts`  
Expected: FAIL because line routes do not exist.

- [ ] **Step 6: Implement PATCH and DELETE**

Use the same response/error helper as the main cart route. Keep validation in
the route boundary and commerce logic in Task 3 operations.

- [ ] **Step 7: Run route tests and the whole unit suite**

Run: `npm run test:unit -- src/app/api/cart/*.test.ts src/app/api/cart/lines/*.test.ts`  
Expected: all cart route tests pass.

Run: `npm test`  
Expected: all repository unit tests pass.

- [ ] **Step 8: Commit the server cart session**

```powershell
git add app/src/lib/cart app/src/app/api/cart
git commit -m "feat(cart): add persistent cart API routes"
```

---

### Task 5: Typed cart client and asynchronous provider

**Context owner:** Storefront agent. Read only `Cart`, the Task 4 HTTP contract, and current cart provider/button.

**Files:**
- Create: `app/src/lib/cart/cart-client.ts`
- Create: `app/src/lib/cart/cart-client.test.ts`
- Modify: `app/src/components/cart/cart-provider.tsx`
- Modify: `app/src/components/cart/add-to-cart-button.tsx`
- Modify: `app/src/app/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: same-origin Task 4 endpoints and `ProductSummary.merchandiseId`
- Produces `useCart()` with:

```ts
{
  cart: Cart | null;
  itemCount: number;
  status: "loading" | "ready" | "mutating" | "error";
  error: string | null;
  isOpen: boolean;
  openCart(): void;
  closeCart(): void;
  addItem(merchandiseId: string, quantity?: number): Promise<void>;
  updateLine(lineId: string, quantity: number): Promise<void>;
  removeLine(lineId: string): Promise<void>;
  clearError(): void;
}
```

- [ ] **Step 1: Write failing HTTP client tests**

Inject `fetch` into a `createCartClient(fetcher)` factory. Assert exact method,
JSON body, and `content-type` for load/add/update/remove. Assert that non-OK
responses throw a `CartClientError` containing only API `code`, safe `message`,
and status.

Run: `npm run test:unit -- src/lib/cart/cart-client.test.ts`  
Expected: FAIL because the client does not exist.

- [ ] **Step 2: Implement the typed cart HTTP client**

Export a production client using global `fetch` with `cache: "no-store"` for
GET. Validate the presence of a `cart` property before returning response data.

- [ ] **Step 3: Replace the in-memory provider state**

On mount, call `loadCart()`. Each mutation must:

1. set `status` to `mutating`;
2. await the matching client operation;
3. replace `cart` with the server response;
4. set `status` to `ready`;
5. on failure set a safe message and `status` to `error` without discarding the
   last successful cart.

Open the sidebar after a successful add. Do not store cart lines or cart ID in
local storage.

- [ ] **Step 4: Pass merchandise ID from the product route**

Change `AddToCartButton` to accept only:

```ts
interface AddToCartButtonProps {
  merchandiseId: string;
  label: string;
}
```

Disable the button while a mutation is active and show `Adding...` during the
request. In the product route, render it only when both
`availableForSale === true` and `merchandiseId` exists; otherwise render the
existing contact CTA.

- [ ] **Step 5: Run client tests, lint, and build**

Run: `npm run test:unit -- src/lib/cart/cart-client.test.ts`  
Expected: all client cases pass.

Run: `npm run lint`  
Expected: exit 0.

Run: `npm run build`  
Expected: production build succeeds in mock mode.

- [ ] **Step 6: Commit the client cart state**

```powershell
git add app/src/lib/cart/cart-client.ts app/src/lib/cart/cart-client.test.ts app/src/components/cart/cart-provider.tsx app/src/components/cart/add-to-cart-button.tsx app/src/app/products/[slug]/page.tsx
git commit -m "feat(cart): connect product actions to Shopify cart"
```

---

### Task 6: Cart presentation, quantity controls, and cart page

**Context owner:** Storefront UI agent. Read only the accepted `useCart()` contract, current cart components, layout tokens, and cart route.

**Files:**
- Create: `app/src/components/cart/cart-content.tsx`
- Create: `app/src/components/cart/cart-line-item.tsx`
- Modify: `app/src/components/cart/cart-sidebar.tsx`
- Modify: `app/src/app/cart/page.tsx`

**Interfaces:**
- Consumes: Task 5 `useCart()`; `CartLine`; `Money`
- Produces: shared accessible cart content for sidebar and `/cart`

- [ ] **Step 1: Extract a shared cart presentation**

`CartContent` must render these states from the provider contract:

- loading skeleton with `aria-busy="true"`;
- empty cart with a link to `/products`;
- error alert with the safe message and dismiss action;
- populated lines and Shopify subtotal;
- disabled mutation controls while `status === "mutating"`.

Format money from `{ amount, currencyCode }` with `Intl.NumberFormat`; never
parse the existing product display price.

- [ ] **Step 2: Implement accessible quantity and removal controls**

Each `CartLineItem` must include:

- linked product title to `/products/<slug>`;
- optional Shopify image;
- unit price and line total;
- decrement and increment buttons with product-specific accessible labels;
- quantity text/input constrained to 1..99;
- remove button using Shopify line ID;
- no optimistic total calculation.

Quantity 1 decrement may call `removeLine`; other changes call `updateLine`.

- [ ] **Step 3: Replace the sidebar preview**

Use `CartContent` inside the current overlay shell. Remove the preview copy.
Keep overlay click close, explicit close button, mobile full width, and desktop
420px width. Add `role="dialog"`, `aria-modal="true"`, and an accessible title.

- [ ] **Step 4: Replace the `/cart` 404 page**

Render a server page shell with heading `Cart` and the client `CartContent`.
The page and sidebar must use the same provider instance from root layout.

- [ ] **Step 5: Manually verify cart interaction states**

Run: `npm run dev`  
Verify at mobile and desktop widths:

1. initial loading does not flash a fake empty cart;
2. empty cart links to products;
3. adding opens sidebar;
4. updating disables duplicate actions;
5. removing the final line shows empty state;
6. refreshing restores the server cart;
7. `/cart` and sidebar show the same state.

- [ ] **Step 6: Run lint and build**

Run: `npm run lint`  
Expected: exit 0.

Run: `npm run build`  
Expected: `/cart` is a successful route, not an intentional 404.

- [ ] **Step 7: Commit the functional cart UI**

```powershell
git add app/src/components/cart/cart-content.tsx app/src/components/cart/cart-line-item.tsx app/src/components/cart/cart-sidebar.tsx app/src/app/cart/page.tsx
git commit -m "feat(cart): add functional cart views"
```

---

### Task 7: Hosted checkout handoff

**Context owner:** Storefront agent. Read only `Cart.checkoutUrl`, shared cart content, and checkout-related copy.

**Files:**
- Create: `app/src/components/cart/checkout-button.tsx`
- Modify: `app/src/components/cart/cart-content.tsx`
- Create: `app/src/components/cart/checkout-button.test.ts`

**Interfaces:**
- Consumes: exact `cart.checkoutUrl` returned through Task 3
- Produces: checkout action available only for a non-empty, non-mutating cart

- [ ] **Step 1: Write checkout guard tests**

Extract and test:

```ts
export function getCheckoutHref(cart: Cart | null): string | null;
```

Assert it returns `null` for no cart, empty lines, zero total quantity, or a URL
whose protocol is not `https:`. Assert it returns the exact unchanged Shopify
HTTPS URL, including query parameters, for a populated cart.

Run: `npm run test:unit -- src/components/cart/checkout-button.test.ts`  
Expected: FAIL because the guard does not exist.

- [ ] **Step 2: Implement the guarded checkout action**

Render a Chakra button as an external anchor using the exact safe href. Label
it `Proceed to checkout`. Do not append, remove, decode, or reconstruct query
parameters. Disable/omit it when the cart is empty or mutating.

- [ ] **Step 3: Add pre-checkout disclosure**

Place copy adjacent to the button stating that payment and delivery details are
completed securely in Shopify checkout. Policy links are added in Phase 2 and
must not be hardcoded before those routes exist.

- [ ] **Step 4: Verify exact checkout handoff with a Shopify test product**

Using a non-production/test product and Shopify test payment configuration:

1. add the product;
2. refresh and confirm persistence;
3. select `Proceed to checkout`;
4. confirm Shopify checkout contains the correct product, quantity, price, and
   currency;
5. confirm the browser used the returned URL including its `key` parameter;
6. complete a test order and confirm it appears under the Headless sales
   channel.

Do not record the checkout URL, cart ID, buyer details, or credentials in test
output or documentation.

- [ ] **Step 5: Run full verification**

Run from `app/`:

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests pass, lint exits 0, and production build succeeds.

- [ ] **Step 6: Commit checkout handoff**

```powershell
git add app/src/components/cart/checkout-button.tsx app/src/components/cart/checkout-button.test.ts app/src/components/cart/cart-content.tsx
git commit -m "feat(checkout): hand cart off to Shopify checkout"
```

---

### Task 8: Merchant setup and cart release notes

**Context owner:** Documentation/quality agent. Read the implemented contracts and Shopify Headless configuration; do not change application behaviour.

**Files:**
- Create: `docs/SHOPIFY-COMMERCE-SETUP.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed Tasks 1-7
- Produces: secret-safe merchant/developer setup and acceptance checklist

- [ ] **Step 1: Document required Headless setup**

Include these merchant actions:

1. install/open Shopify Headless sales channel;
2. create/select the storefront;
3. enable Storefront product access;
4. publish the purchasable product to Headless;
5. ensure the product has an available default variant with price and stock
   settings appropriate to the store;
6. configure payment provider or Shopify test mode;
7. set shipping markets/rates and taxes in Shopify;
8. store the existing environment variable names without example secrets.

State that Admin API access is not required for this cart/checkout flow.

- [ ] **Step 2: Document acceptance and recovery checks**

Include:

- product unavailable and missing variant behaviour;
- cart refresh persistence;
- expired cart recovery;
- quantity update/removal;
- exact checkout content;
- test order attribution;
- token rotation without committing credentials;
- rollback by deploying the previous known-good `main` commit.

- [ ] **Step 3: Link setup guide from README**

Add the guide under Env/Commands without duplicating its content.

- [ ] **Step 4: Verify documentation and repository state**

Run: `rg -n "shpat_|shpca_|SHOPIFY_STOREFRONT_PUBLIC_TOKEN=" docs README.md`  
Expected: no credential value is present; only variable names or empty examples
are allowed.

Run: `git diff --check`  
Expected: no whitespace errors.

- [ ] **Step 5: Commit merchant setup documentation**

```powershell
git add docs/SHOPIFY-COMMERCE-SETUP.md README.md
git commit -m "docs: add Shopify commerce setup guide"
```

