import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./products/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const heroSource = readFileSync(
  new URL("../components/page-components/product-details/hero.tsx", import.meta.url),
  "utf8",
);

test("the lower purchase button is centered without surrounding separators", () => {
  assert.match(
    source,
    /<Stack align="center">[\s\S]*?<AddToCartButton[\s\S]*?<\/Stack>\s*<\/Stack>/,
  );
  assert.doesNotMatch(
    source,
    /<Separator\s*\/>\s*<Stack align="center">[\s\S]*?<\/Stack>\s*<Separator\s*\/>/,
  );
});

test("the product hero uses the approved responsive spacing", () => {
  assert.match(heroSource, /<Stack gap=\{\{ base: 6, md: 12 \}\} align="center">/);
});
