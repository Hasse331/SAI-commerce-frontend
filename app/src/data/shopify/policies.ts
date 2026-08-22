import { storefrontQuery } from "./storefront-client";

export interface ShopifyPolicy {
  title: string | null;
  body: string | null;
  handle: string | null;
  url: string | null;
}

export interface ShopifyPolicies {
  privacyPolicy: ShopifyPolicy | null;
  refundPolicy: ShopifyPolicy | null;
  shippingPolicy: ShopifyPolicy | null;
  termsOfService: ShopifyPolicy | null;
}

interface ShopifyPoliciesQueryData {
  shop: ShopifyPolicies;
}

type StorefrontPolicyRequest = <TData>(query: string) => Promise<TData>;

export const STORE_POLICIES_QUERY = `
  query StorePolicies {
    shop {
      privacyPolicy { title body handle url }
      refundPolicy { title body handle url }
      shippingPolicy { title body handle url }
      termsOfService { title body handle url }
    }
  }
`;

export function createShopifyPolicyClient(request: StorefrontPolicyRequest) {
  async function getShopifyPolicies(): Promise<ShopifyPolicies> {
    const data = await request<ShopifyPoliciesQueryData>(STORE_POLICIES_QUERY);
    return data.shop;
  }

  return { getShopifyPolicies };
}

export const { getShopifyPolicies } = createShopifyPolicyClient(storefrontQuery);
