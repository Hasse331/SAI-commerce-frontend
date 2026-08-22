import assert from "node:assert/strict";
import test from "node:test";
import { mapShopifyPolicies } from "./policies.ts";

test("policy mapper preserves privacy, refund, shipping, and terms order", () => {
  const policies = mapShopifyPolicies({
    privacyPolicy: {
      title: "Privacy policy",
      body: "<p>Privacy details</p>",
      handle: "privacy",
      url: "https://store.example/policies/privacy-policy",
    },
    refundPolicy: {
      title: "Refund policy",
      body: "<p>Refund details</p>",
      handle: "refund",
      url: "https://store.example/policies/refund-policy",
    },
    shippingPolicy: {
      title: "Shipping policy",
      body: "<p>Shipping details</p>",
      handle: "shipping",
      url: "https://store.example/policies/shipping-policy",
    },
    termsOfService: {
      title: "Terms of service",
      body: "<p>Terms details</p>",
      handle: "terms",
      url: "https://store.example/policies/terms-of-service",
    },
  });

  assert.deepEqual(
    policies.map((policy) => policy.handle),
    ["privacy", "refund", "shipping", "terms"],
  );
});

test("policy mapper preserves Shopify policy order and omits null or blank policies", () => {
  const policies = mapShopifyPolicies({
    privacyPolicy: {
      title: "Privacy policy",
      body: "<p>Privacy details</p>",
      handle: "privacy",
      url: "https://store.example/policies/privacy-policy",
    },
    refundPolicy: null,
    shippingPolicy: {
      title: "Shipping policy",
      body: "<p>Shipping details</p>",
      handle: "   ",
      url: "https://store.example/policies/shipping-policy",
    },
    termsOfService: {
      title: "  ",
      body: "<p>Terms details</p>",
      handle: "terms",
      url: "https://store.example/policies/terms-of-service",
    },
  });

  assert.deepEqual(policies, [
    {
      title: "Privacy policy",
      handle: "privacy",
      href: "/policies/privacy",
      bodyHtml: "<p>Privacy details</p>",
    },
  ]);
});

test("policy mapper omits a policy whose body is empty after sanitization", () => {
  const policies = mapShopifyPolicies({
    privacyPolicy: {
      title: "Privacy policy",
      body: "<script>alert(1)</script>",
      handle: "privacy",
      url: "https://store.example/policies/privacy-policy",
    },
    refundPolicy: null,
    shippingPolicy: null,
    termsOfService: null,
  });

  assert.deepEqual(policies, []);
});

test("policy mapper removes policies with blank body and always uses local storefront hrefs", () => {
  const policies = mapShopifyPolicies({
    privacyPolicy: {
      title: "Privacy policy",
      body: "  ",
      handle: "privacy",
      url: "https://store.example/policies/privacy-policy",
    },
    refundPolicy: {
      title: "Refund policy",
      body: "<p>Refund details</p>",
      handle: "refund",
      url: "https://store.example/policies/refund-policy",
    },
    shippingPolicy: null,
    termsOfService: null,
  });

  assert.deepEqual(policies, [
    {
      title: "Refund policy",
      handle: "refund",
      href: "/policies/refund",
      bodyHtml: "<p>Refund details</p>",
    },
  ]);
});
