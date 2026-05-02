import test from "node:test";
import assert from "node:assert/strict";

import { productComponentFieldKeys } from "./components.ts";

test("product detail large media field keys use the renamed Shopify handles", () => {
  assert.equal(productComponentFieldKeys.detailLargeImage, "large_media_1");
  assert.equal(productComponentFieldKeys.detailLargeImage2, "large_media_2");
});
