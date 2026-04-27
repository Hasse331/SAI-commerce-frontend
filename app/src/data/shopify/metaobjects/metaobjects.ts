import { shopifyPageMetaobjects } from "./pages";
import { shopifySharedMetaobjects } from "./shared";

export const shopifyMetaobjects = {
  sharedBrandData: shopifySharedMetaobjects.brand,
  sharedContactData: shopifySharedMetaobjects.contact,
  homePage: shopifyPageMetaobjects.homePage,
  productsPage: shopifyPageMetaobjects.productsPage,
  productDetailsPage: shopifyPageMetaobjects.productDetailsPage,
} as const;

export * from "./components";
export * from "./pages";
export * from "./seo";
export * from "./shared";
