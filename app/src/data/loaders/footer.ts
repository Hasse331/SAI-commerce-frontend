import { hasArticlesContent } from "@/data/loaders/articles";
import { buildFooterLinkGroups } from "@/data/mappers";
import { getProductsPageData } from "@/data/loaders/products-page";
import { getNavigationLinks } from "@/data/contents/navigation-links";
import type { FooterData } from "@/types/footer";
import { getContactMethodsData } from "./contact-methods";
import { getStorePolicies } from "./policies";

export async function getFooterData(): Promise<FooterData> {
  const [productsPageData, hasArticles, contactItems, policies] = await Promise.all([
    getProductsPageData(),
    hasArticlesContent(),
    getContactMethodsData(),
    getStorePolicies(),
  ]);
  const navigationLinks = getNavigationLinks(hasArticles);

  return {
    linkGroups: buildFooterLinkGroups({
      navigationLinks,
      products: productsPageData.items,
      policies,
    }),
    contactItems,
  };
}
