export type ShopifyAnalyticsConfig = Readonly<{
  shopId: string;
  storefrontId: string;
  myshopifyDomain: string;
}>;

export function getShopifyAnalyticsConfig(): ShopifyAnalyticsConfig | null {
  const shopId = process.env.SHOPIFY_SHOP_ID?.trim();
  const storefrontId = process.env.SHOPIFY_STOREFRONT_ID?.trim();
  const myshopifyDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!shopId || !storefrontId || !myshopifyDomain) return null;
  return { shopId, storefrontId, myshopifyDomain };
}
