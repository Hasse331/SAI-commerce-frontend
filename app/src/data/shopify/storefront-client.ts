import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from "@shopify/storefront-api-client";

let storefrontClient: StorefrontApiClient | null = null;

export function resolveStorefrontApiVersion(value: string | undefined): string {
  const apiVersion = value?.trim();

  if (!apiVersion) {
    throw new Error("Missing SHOPIFY_STOREFRONT_API_VERSION");
  }

  return apiVersion;
}

export async function storefrontQuery<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const client = getStorefrontClient();
  const { data, errors } = await client.request<TData>(query, { variables });

  if (errors) {
    throw new Error(errors.message || "Unknown Shopify error");
  }

  if (!data) {
    throw new Error("Missing Shopify response data");
  }

  return data;
}

function getStorefrontClient(): StorefrontApiClient {
  if (storefrontClient) {
    return storefrontClient;
  }

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

  if (!storeDomain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN");
  }

  if (!storefrontToken) {
    throw new Error("Missing SHOPIFY_STOREFRONT_PUBLIC_TOKEN");
  }

  const apiVersion = resolveStorefrontApiVersion(
    process.env.SHOPIFY_STOREFRONT_API_VERSION,
  );

  storefrontClient = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: storefrontToken,
    clientName: "sai-commerce-frontend",
    retries: 1,
    customFetchApi: (url, init) =>
      fetch(url, {
        ...init,
        next: { revalidate: 60 },
      }),
  });

  return storefrontClient;
}
