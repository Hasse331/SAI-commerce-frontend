import assert from "node:assert/strict";
import test from "node:test";
import { resolvePolicyPage } from "./policies/[handle]/policy-page";

const policy = {
  title: "Privacy policy",
  handle: "privacy",
  href: "/policies/privacy",
  bodyHtml: "<p>Privacy details</p>",
};

test("policy route resolution provides local noindex metadata for an available policy", () => {
  assert.deepEqual(resolvePolicyPage(policy), {
    policy,
    metadata: {
      title: "Privacy policy",
      canonical: "/policies/privacy",
      robots: { index: false, follow: true },
    },
  });
});

test("policy route resolution marks a missing policy for not-found handling", () => {
  assert.equal(resolvePolicyPage(undefined), undefined);
});
