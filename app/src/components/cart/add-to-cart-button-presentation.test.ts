import assert from "node:assert/strict";
import test from "node:test";

import { addToCartButtonPresentation } from "./add-to-cart-button-presentation.ts";

test("product detail purchase buttons become prominent on desktop", () => {
  assert.deepEqual(addToCartButtonPresentation, {
    minW: { base: "auto", md: "240px" },
    h: { base: "auto", md: "64px" },
    px: { base: 4, md: 10 },
    fontSize: { base: "md", md: "xl" },
    fontWeight: "semibold",
  });
});
