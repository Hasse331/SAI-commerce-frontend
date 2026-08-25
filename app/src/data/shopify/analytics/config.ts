import { storefrontQuery } from "../storefront-client";

export type ShopifyPrivacyConfig = Readonly<{
  checkoutRootDomain: string;
  storefrontRootDomain: string;
  storefrontAccessToken: string;
}>;

export type ShopifyAnalyticsConfig = Readonly<{
  shop: Readonly<{
    shopId: string;
    myshopifyDomain: string;
  }>;
  privacy: ShopifyPrivacyConfig;
}>;

type ShopifyIdentityQuery = {
  shop: {
    id: string;
    primaryDomain: { host: string };
  };
};

type ShopifyAnalyticsConfigInput = {
  shop: ShopifyIdentityQuery["shop"];
  storeDomain: string;
  storefrontAccessToken: string;
  siteUrl: string;
};

type ShopifyAnalyticsEnvironment = Omit<ShopifyAnalyticsConfigInput, "shop">;
type ShopifyIdentityQueryFn = () => Promise<ShopifyIdentityQuery>;

const shopIdentityQuery = `
  query AnalyticsShopIdentity {
    shop {
      id
      primaryDomain {
        host
      }
    }
  }
`;

function normalizeHost(value: string): string {
  return value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}

function resolveStorefrontRootDomain(storefrontHost: string, checkoutHost: string): string | null {
  const storefrontRootDomain = storefrontHost.replace(/^www\./, "");
  const acceptedCheckoutHosts = new Set([
    storefrontRootDomain,
    `checkout.${storefrontRootDomain}`,
  ]);
  return acceptedCheckoutHosts.has(checkoutHost) ? storefrontRootDomain : null;
}

export function resolveShopifyAnalyticsConfig({
  shop,
  storeDomain,
  storefrontAccessToken,
  siteUrl,
}: ShopifyAnalyticsConfigInput): ShopifyAnalyticsConfig | null {
  let storefrontHost: string;
  try {
    storefrontHost = new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  const checkoutRootDomain = normalizeHost(shop.primaryDomain.host);
  const storefrontRootDomain = resolveStorefrontRootDomain(storefrontHost, checkoutRootDomain);
  const myshopifyDomain = normalizeHost(storeDomain);
  if (!shop.id || !checkoutRootDomain || !storefrontRootDomain || !myshopifyDomain || !storefrontAccessToken) return null;

  return {
    shop: { shopId: shop.id, myshopifyDomain },
    privacy: { checkoutRootDomain, storefrontRootDomain, storefrontAccessToken },
  };
}

export async function loadShopifyAnalyticsConfig(
  environment: ShopifyAnalyticsEnvironment,
  queryShopIdentity: ShopifyIdentityQueryFn,
): Promise<ShopifyAnalyticsConfig | null> {
  try {
    const data = await queryShopIdentity();
    return resolveShopifyAnalyticsConfig({ ...environment, shop: data.shop });
  } catch {
    return null;
  }
}

export async function getShopifyAnalyticsConfig(): Promise<ShopifyAnalyticsConfig | null> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!storeDomain || !storefrontAccessToken || !siteUrl) return null;

  return loadShopifyAnalyticsConfig({
    storeDomain,
    storefrontAccessToken,
    siteUrl,
  }, () => storefrontQuery<ShopifyIdentityQuery>(shopIdentityQuery));
}
