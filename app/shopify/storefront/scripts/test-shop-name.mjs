const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

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

const query = `
  query TestShopName {
    shop {
      name
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
    body: JSON.stringify({ query }),
  },
);

const json = await response.json();

if (!response.ok || json.errors) {
  console.error("Shopify request failed:");
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log(`Shop name: ${json.data.shop.name}`);
