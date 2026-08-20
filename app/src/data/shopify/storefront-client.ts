import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from "@shopify/storefront-api-client";

export interface StorefrontRequestOptions {
  cache?: "no-store";
}

type StorefrontCachePolicy = "revalidate" | "no-store";

let storefrontContentClient: StorefrontApiClient | null = null;
let storefrontCartClient: StorefrontApiClient | null = null;

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
  options?: StorefrontRequestOptions,
): Promise<TData> {
  const client = getStorefrontClient(
    options?.cache === "no-store" ? "no-store" : "revalidate",
  );
  const { data, errors } = await client.request<TData>(query, { variables });

  if (errors) {
    throw new Error(errors.message || "Unknown Shopify error");
  }

  if (!data) {
    throw new Error("Missing Shopify response data");
  }

  return data;
}

function applyCachePolicy(
  init: RequestInit | undefined,
  cachePolicy: StorefrontCachePolicy,
): RequestInit {
  const requestInit: RequestInit = { ...init };

  if (cachePolicy === "no-store") {
    delete requestInit.next;
    requestInit.cache = "no-store";
    return requestInit;
  }

  requestInit.next = { revalidate: 60 };
  return requestInit;
}

function getStorefrontClient(
  cachePolicy: StorefrontCachePolicy,
): StorefrontApiClient {
  const existingClient =
    cachePolicy === "no-store" ? storefrontCartClient : storefrontContentClient;

  if (existingClient) {
    return existingClient;
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

  const client = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: storefrontToken,
    clientName: "sai-commerce-frontend",
    retries: 1,
    customFetchApi: (url, init) =>
      fetch(url, applyCachePolicy(init, cachePolicy)),
  });

  if (cachePolicy === "no-store") {
    storefrontCartClient = client;
  } else {
    storefrontContentClient = client;
  }

  return client;
}
