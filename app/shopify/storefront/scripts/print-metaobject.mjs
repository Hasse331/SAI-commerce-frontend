const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

const metaobjectType =
  process.argv[2] || process.env.SHOPIFY_METAOBJECT_TYPE || "";
const metaobjectHandle =
  process.argv[3] || process.env.SHOPIFY_METAOBJECT_HANDLE || "";

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

if (!metaobjectType || !metaobjectHandle) {
  console.error(
    "Usage: node print-metaobject.mjs <metaobject-type> <metaobject-handle>",
  );
  console.error(
    "You can also provide SHOPIFY_METAOBJECT_TYPE and SHOPIFY_METAOBJECT_HANDLE in the environment.",
  );
  process.exit(1);
}

const query = `
  query PrintMetaobject($type: String!, $handle: String!) {
    metaobject(handle: { type: $type, handle: $handle }) {
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
          ... on Product {
            id
            handle
            title
          }
        }
        references(first: 50) {
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
            ... on Product {
              id
              handle
              title
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
        type: metaobjectType,
        handle: metaobjectHandle,
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

console.log(JSON.stringify(json.data.metaobject, null, 2));
