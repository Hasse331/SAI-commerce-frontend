import assert from "node:assert/strict";
import test from "node:test";
import { createPolicySitemapEntries } from "./sitemap";

test("sitemap entries contain exactly the available local policy URLs", () => {
  assert.deepEqual(
    createPolicySitemapEntries("https://store.example", [
      { handle: "refund", title: "Refund policy", href: "/policies/refund" },
      { handle: "terms", title: "Terms of service", href: "/policies/terms" },
    ]),
    [
      { url: "https://store.example/policies/refund" },
      { url: "https://store.example/policies/terms" },
    ],
  );
});

test("sitemap entries are empty when no policies are available", () => {
  assert.deepEqual(createPolicySitemapEntries("https://store.example", []), []);
});
