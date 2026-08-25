import type { NextConfig } from "next";
import path from "node:path";
import { isShopifyPageViewModule } from "./src/lib/shopify-analytics/webpack-compat";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^\.\/page-view\.mjs$/,
        (resource: { request: string; context: string }) => {
          if (isShopifyPageViewModule(resource.request, resource.context)) {
            resource.request = path.resolve(
              __dirname,
              "src/lib/shopify-analytics/page-view-shim.ts",
            );
          }
        },
      ),
    );
    return config;
  },
};

export default nextConfig;
