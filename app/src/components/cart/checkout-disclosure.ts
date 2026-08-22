import type { PolicyLink } from "@/types/policies";

interface CheckoutDisclosure {
  message: string;
  links: Array<{ label: string; href: string }>;
}

export function getCheckoutDisclosure(
  policies: PolicyLink[],
): CheckoutDisclosure | undefined {
  if (policies.length === 0) {
    return undefined;
  }

  return {
    message: "Checkout is hosted by Shopify. Review the store policies before continuing.",
    links: policies.map((policy) => ({ label: policy.title, href: policy.href })),
  };
}
