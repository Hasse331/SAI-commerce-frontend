import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { isShopifyPageViewModule } from "../../../lib/shopify-analytics/webpack-compat.ts";

test("Next replaces the toolkit automatic page observer with the no-op compatibility module", () => {
  const config = readFileSync(new URL("../../../../next.config.ts", import.meta.url), "utf8");
  const shim = readFileSync(new URL("../../../lib/shopify-analytics/page-view-shim.ts", import.meta.url), "utf8");
  assert.match(config, /\^\\\.\\\/page-view\\\.mjs\$/);
  assert.match(config, /page-view-shim\.ts/);
  assert.doesNotMatch(shim, /observeNavigation|new PageViewEvent|addEventListener/);
});

test("compatibility matcher accepts only Hydrogen's actual relative page-view request", () => {
  assert.equal(
    isShopifyPageViewModule(
      "./page-view.mjs",
      "C:\\repo\\node_modules\\@shopify\\hydrogen\\dist\\core\\shopify-scripts",
    ),
    true,
  );
  assert.equal(
    isShopifyPageViewModule(
      "./page-view.mjs",
      "/repo/node_modules/@shopify/hydrogen/dist/development/core/shopify-scripts",
    ),
    true,
  );
  assert.equal(isShopifyPageViewModule("./page-view.mjs", "C:\\repo\\src"), false);
  assert.equal(
    isShopifyPageViewModule(
      "./page-view.mjs",
      "/repo/node_modules/@shopify/hydrogen/dist/vue/shopify-scripts",
    ),
    false,
  );
  assert.equal(
    isShopifyPageViewModule(
      "./page-view.mjs",
      "/repo/node_modules/@shopify/hydrogen-copy/dist/core/shopify-scripts",
    ),
    false,
  );
  assert.equal(
    isShopifyPageViewModule(
      "https://cdn.shopify.com/storefront/standard-events.js",
      "C:\\repo\\node_modules\\@shopify\\hydrogen\\dist\\core\\shopify-scripts",
    ),
    false,
  );
});
