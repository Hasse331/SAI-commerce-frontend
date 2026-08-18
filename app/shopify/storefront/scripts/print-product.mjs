const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
const productHandle = process.argv[2] || process.env.SHOPIFY_PRODUCT_HANDLE || "";
const metafieldNamespace =
  process.argv[3] || process.env.SHOPIFY_METAFIELD_NAMESPACE || "custom";
const metafieldKey =
  process.argv[4] || process.env.SHOPIFY_METAFIELD_KEY || "product_page";

if (!storeDomain) {
  console.error("Missing SHOPIFY_STORE_DOMAIN in environment");
  process.exit(1);
}

if (!storefrontToken) {
  console.error("Missing SHOPIFY_STOREFRONT_PUBLIC_TOKEN in environment");
  process.exit(1);
}

if (!apiVersion) {
  console.error("Missing SHOPIFY_STOREFRONT_API_VERSION in environment");
  process.exit(1);
}

if (!productHandle) {
  console.error(
    "Usage: node print-product.mjs <product-handle> [metafield-namespace] [metafield-key]",
  );
  console.error(
    "You can also provide SHOPIFY_PRODUCT_HANDLE in the environment.",
  );
  process.exit(1);
}

const query = `
  query PrintProduct(
    $handle: String!
    $namespace: String!
    $key: String!
  ) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      metafield(namespace: $namespace, key: $key) {
        type
        value
        reference {
          __typename
          ... on Metaobject {
            id
            type
            handle
            fields {
              key
              value
              type
              reference {
                __typename
                ... on Metaobject {
                  id
                  type
                  handle
                  fields {
                    key
                    value
                    type
                  }
                }
              }
              references(first: 25) {
                nodes {
                  __typename
                  ... on Metaobject {
                    id
                    type
                    handle
                    fields {
                      key
                      value
                      type
                    }
                  }
                }
              }
            }
          }
        }
        references(first: 25) {
          nodes {
            __typename
            ... on Metaobject {
              id
              type
              handle
              fields {
                key
                value
                type
              }
            }
          }
        }
      }
    }
  }
`;

const response = await fetch(
  `https://${storeDomain}/api/${apiVersion}/graphql.json`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({
      query,
      variables: {
        handle: productHandle,
        namespace: metafieldNamespace,
        key: metafieldKey,
      },
    }),
  },
);

const json = await response.json();

if (!response.ok || json.errors) {
  console.error("Shopify request failed:");
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(json.data.product, null, 2));
