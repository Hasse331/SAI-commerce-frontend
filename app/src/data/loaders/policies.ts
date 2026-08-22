import { cache } from "react";
import type { StorePolicy } from "@/types/policies";
import { isShopifyDataSource } from "../source";
import { mapShopifyPolicies } from "../mappers/policies";
import { getShopifyPolicies } from "../shopify/policies";

interface PolicyLoaderDependencies {
  isShopifySource: () => boolean;
  getShopifyPolicies: () => Promise<StorePolicy[]>;
  memoize?: typeof cache;
}

const identityMemoize: typeof cache = (load) => load;

export function createPolicyLoaders({
  isShopifySource,
  getShopifyPolicies: loadShopifyPolicies,
  memoize = identityMemoize,
}: PolicyLoaderDependencies) {
  const getStorePolicies = memoize(async (): Promise<StorePolicy[]> => {
    if (!isShopifySource()) {
      return [];
    }

    return loadShopifyPolicies();
  });

  async function getStorePolicy(handle: string): Promise<StorePolicy | undefined> {
    const policies = await getStorePolicies();
    return policies.find((policy) => policy.handle === handle);
  }

  return { getStorePolicies, getStorePolicy };
}

const policyLoaders = createPolicyLoaders({
  isShopifySource: isShopifyDataSource,
  getShopifyPolicies: async () => mapShopifyPolicies(await getShopifyPolicies()),
  memoize: cache,
});

export const { getStorePolicies, getStorePolicy } = policyLoaders;
