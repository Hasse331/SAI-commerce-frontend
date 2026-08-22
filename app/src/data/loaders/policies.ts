import type { StorePolicy } from "@/types/policies";
import { isShopifyDataSource } from "../source";
import { mapShopifyPolicies } from "../mappers/policies";
import { getShopifyPolicies } from "../shopify/policies";

interface PolicyLoaderDependencies {
  isShopifySource: () => boolean;
  getShopifyPolicies: () => Promise<StorePolicy[]>;
}

export function createPolicyLoaders({
  isShopifySource,
  getShopifyPolicies: loadShopifyPolicies,
}: PolicyLoaderDependencies) {
  async function getStorePolicies(): Promise<StorePolicy[]> {
    if (!isShopifySource()) {
      return [];
    }

    return loadShopifyPolicies();
  }

  async function getStorePolicy(handle: string): Promise<StorePolicy | undefined> {
    const policies = await getStorePolicies();
    return policies.find((policy) => policy.handle === handle);
  }

  return { getStorePolicies, getStorePolicy };
}

const policyLoaders = createPolicyLoaders({
  isShopifySource: isShopifyDataSource,
  getShopifyPolicies: async () => mapShopifyPolicies(await getShopifyPolicies()),
});

export const { getStorePolicies, getStorePolicy } = policyLoaders;
