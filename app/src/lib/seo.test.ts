import test from "node:test";
import assert from "node:assert/strict";

import {
  clampSeoDescription,
  clampSeoTitle,
  resolvePageSeo,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "./seo.ts";

test("resolvePageSeo prefers explicit SEO values when provided", () => {
  const seo = resolvePageSeo({
    seo: {
      title: "SPECTRUM AUDIO INSTRUMENTS - AMPLIFIERS & PEDALS",
      description: "Handcrafted high-end amplifiers and pedals.",
    },
    fallbackTitleParts: ["Ignored fallback title"],
    fallbackDescriptionParts: ["Ignored fallback description"],
  });

  assert.equal(
    seo.title,
    "SPECTRUM AUDIO INSTRUMENTS - AMPLIFIERS & PEDALS",
  );
  assert.equal(seo.description, "Handcrafted high-end amplifiers and pedals.");
});

test("resolvePageSeo builds fallback values from page content", () => {
  const seo = resolvePageSeo({
    fallbackTitleParts: [
      "Handcrafted boutique amplifiers",
      "designed for studios and stages",
    ],
    fallbackDescriptionParts: [
      "Precision-built analog amplifiers for studio engineers, touring players, and demanding producers.",
      "Each unit is hand-assembled and tested in-house.",
    ],
  });

  assert.equal(seo.title.length <= SEO_TITLE_MAX_LENGTH, true);
  assert.equal(seo.description.length <= SEO_DESCRIPTION_MAX_LENGTH, true);
  assert.match(seo.title, /Handcrafted boutique amplifiers/i);
  assert.match(seo.description, /Precision-built analog amplifiers/i);
});

test("clampSeoTitle trims whitespace and enforces the title limit", () => {
  const title = clampSeoTitle(
    "  A very long SEO title that should definitely be trimmed before it reaches search results and keeps going  ",
  );

  assert.equal(title.length <= SEO_TITLE_MAX_LENGTH, true);
  assert.equal(title.includes("  "), false);
});

test("clampSeoDescription trims whitespace and enforces the description limit", () => {
  const description = clampSeoDescription(
    "  This description contains a lot of extra wording so we can confirm that the SEO helper trims it down to a safe search snippet length without leaving messy whitespace behind.  ",
  );

  assert.equal(description.length <= SEO_DESCRIPTION_MAX_LENGTH, true);
  assert.equal(description.includes("  "), false);
});
