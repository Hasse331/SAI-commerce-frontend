import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const scripts = [
  { name: "test-shop-name.mjs", args: [] },
  { name: "print-product.mjs", args: ["synthetic-product"] },
  {
    name: "print-metaobject.mjs",
    args: ["synthetic_type", "synthetic-handle"],
  },
] as const;

function runStorefrontScript(
  scriptName: string,
  apiVersion: string | undefined,
  scriptArgs: readonly string[] = [],
) {
  const scriptPath = path.join(
    process.cwd(),
    "shopify",
    "storefront",
    "scripts",
    scriptName,
  );
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    SHOPIFY_STORE_DOMAIN: "store.example",
    SHOPIFY_STOREFRONT_PUBLIC_TOKEN: "synthetic-public-token",
  };

  delete environment.SHOPIFY_PRODUCT_HANDLE;
  delete environment.SHOPIFY_METAOBJECT_TYPE;
  delete environment.SHOPIFY_METAOBJECT_HANDLE;

  if (apiVersion === undefined) {
    delete environment.SHOPIFY_STOREFRONT_API_VERSION;
  } else {
    environment.SHOPIFY_STOREFRONT_API_VERSION = apiVersion;
  }

  const bootstrap = `
    globalThis.fetch = async (url) => {
      console.log("FETCH_URL=" + url);
      return {
        ok: true,
        json: async () => ({
          data: {
            shop: { name: "Synthetic shop" },
            product: null,
            metaobject: null,
          },
        }),
      };
    };
    await import(${JSON.stringify(pathToFileURL(scriptPath).href)});
  `;

  return spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      bootstrap,
      "script-wrapper",
      ...scriptArgs,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: environment,
      timeout: 5_000,
    },
  );
}

test("Storefront scripts reject a missing or blank API version before other work", () => {
  for (const script of scripts) {
    for (const apiVersion of [undefined, "   "]) {
      const result = runStorefrontScript(script.name, apiVersion);

      assert.equal(result.status, 1, `${script.name} must exit with status 1`);
      assert.equal(
        result.stderr.trimEnd(),
        "Missing SHOPIFY_STOREFRONT_API_VERSION in environment",
        `${script.name} must report only the safe missing-version error`,
      );
      assert.equal(
        result.stdout,
        "",
        `${script.name} must not validate arguments or attempt fetch first`,
      );
    }
  }
});

test("Storefront scripts trim an explicit API version before their stubbed request", () => {
  for (const script of scripts) {
    const result = runStorefrontScript(script.name, " 2099-01 ", script.args);

    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /^FETCH_URL=https:\/\/store\.example\/api\/2099-01\/graphql\.json$/m,
    );
  }
});
