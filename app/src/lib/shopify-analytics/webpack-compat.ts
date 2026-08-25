export function isShopifyPageViewModule(request: string, context: string): boolean {
  const normalizedContext = context.replaceAll("\\", "/");
  return (
    request === "./page-view.mjs" &&
    /(?:^|\/)node_modules\/@shopify\/hydrogen\/dist\/(?:core|development\/core)\/shopify-scripts$/.test(
      normalizedContext,
    )
  );
}
