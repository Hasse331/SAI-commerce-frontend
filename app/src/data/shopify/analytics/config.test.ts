import assert from "node:assert/strict";
import test from "node:test";
import { loadShopifyAnalyticsConfig, resolveShopifyAnalyticsConfig } from "./config.ts";

test("builds headless analytics and privacy config from existing storefront settings", () => {
  assert.deepEqual(
    resolveShopifyAnalyticsConfig({
      shop: {
        id: "gid://shopify/Shop/102871368025",
        primaryDomain: { host: "checkout.spectrumaudio.net" },
      },
      storeDomain: "spectrum-audio-instruments.myshopify.com",
      storefrontAccessToken: "public-storefront-token",
      siteUrl: "https://www.spectrumaudio.net",
    }),
    {
      shop: {
        shopId: "gid://shopify/Shop/102871368025",
        myshopifyDomain: "spectrum-audio-instruments.myshopify.com",
      },
      privacy: {
        checkoutRootDomain: "checkout.spectrumaudio.net",
        storefrontRootDomain: "spectrumaudio.net",
        storefrontAccessToken: "public-storefront-token",
      },
    },
  );
});

test("rejects analytics config when storefront and checkout do not share a root domain", () => {
  assert.equal(
    resolveShopifyAnalyticsConfig({
      shop: {
        id: "gid://shopify/Shop/1",
        primaryDomain: { host: "shop.myshopify.com" },
      },
      storeDomain: "shop.myshopify.com",
      storefrontAccessToken: "public-storefront-token",
      siteUrl: "https://storefront.example.com",
    }),
    null,
  );
});

test("rejects an Online Store host that is not an accepted checkout host", () => {
  assert.equal(
    resolveShopifyAnalyticsConfig({
      shop: {
        id: "gid://shopify/Shop/1",
        primaryDomain: { host: "www.spectrumaudio.net" },
      },
      storeDomain: "spectrum-audio-instruments.myshopify.com",
      storefrontAccessToken: "public-storefront-token",
      siteUrl: "https://spectrumaudio.net",
    }),
    null,
  );
});

test("keeps the storefront available when the optional analytics identity query fails", async () => {
  const config = await loadShopifyAnalyticsConfig(
    {
      storeDomain: "spectrum-audio-instruments.myshopify.com",
      storefrontAccessToken: "public-storefront-token",
      siteUrl: "https://spectrumaudio.net",
    },
    async () => {
      throw new Error("Shopify unavailable");
    },
  );

  assert.equal(config, null);
});
