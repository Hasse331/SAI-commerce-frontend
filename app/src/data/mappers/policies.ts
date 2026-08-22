import type { StorePolicy } from "@/types/policies";
import type { ShopifyPolicies, ShopifyPolicy } from "../shopify/policies";
import { sanitizePolicyHtml } from "../../lib/policies/sanitize-policy-html";

const POLICY_ORDER: Array<keyof ShopifyPolicies> = [
  "privacyPolicy",
  "refundPolicy",
  "shippingPolicy",
  "termsOfService",
];

function mapShopifyPolicy(policy: ShopifyPolicy | null): StorePolicy | undefined {
  if (!policy) {
    return undefined;
  }

  const handle = policy.handle?.trim();
  const title = policy.title?.trim();
  const body = policy.body?.trim();

  if (!handle || !title || !body) {
    return undefined;
  }

  const bodyHtml = sanitizePolicyHtml(body).trim();

  if (!bodyHtml) {
    return undefined;
  }

  return {
    handle,
    title,
    href: `/policies/${handle}`,
    bodyHtml,
  };
}

export function mapShopifyPolicies(policies: ShopifyPolicies): StorePolicy[] {
  return POLICY_ORDER.flatMap((key) => {
    const policy = mapShopifyPolicy(policies[key]);
    return policy ? [policy] : [];
  });
}
