import assert from "node:assert/strict";
import test from "node:test";

import { addToCartButtonPresentation } from "./add-to-cart-button-presentation.ts";

test("product detail purchase buttons become prominent on desktop", () => {
  assert.deepEqual(addToCartButtonPresentation, {
    minW: { md: "240px" },
    h: { md: "64px" },
    px: { md: 10 },
    fontSize: { md: "xl" },
    fontWeight: { md: "semibold" },
  });
});
