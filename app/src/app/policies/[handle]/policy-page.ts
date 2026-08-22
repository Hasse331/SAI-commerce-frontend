import type { StorePolicy } from "@/types/policies";

export interface PolicyPageResolution {
  policy: StorePolicy;
  metadata: {
    title: string;
    canonical: string;
    robots: { index: false; follow: true };
  };
}

export function resolvePolicyPage(
  policy: StorePolicy | undefined,
): PolicyPageResolution | undefined {
  if (!policy) {
    return undefined;
  }

  return {
    policy,
    metadata: {
      title: policy.title,
      canonical: policy.href,
      robots: { index: false, follow: true },
    },
  };
}
