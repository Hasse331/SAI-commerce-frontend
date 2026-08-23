import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /shopify-scripts[\\/]page-view\.mjs$/,
        path.resolve(__dirname, "src/lib/shopify-analytics/page-view-shim.ts"),
      ),
    );
    return config;
  },
};

export default nextConfig;
