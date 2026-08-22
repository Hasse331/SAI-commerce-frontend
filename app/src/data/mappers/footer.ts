import { footerLabels } from "@/data/contents/footer-labels";
import type { FooterLinkGroup, FooterLinkItem } from "@/types/footer";
import type { PolicyLink } from "@/types/policies";
import type { ProductSummary } from "@/types/products";

interface BuildFooterLinkGroupsInput {
  navigationLinks: FooterLinkItem[];
  products: ProductSummary[];
  policies: PolicyLink[];
}

export function buildFooterLinkGroups({
  navigationLinks,
  products,
  policies,
}: BuildFooterLinkGroupsInput): FooterLinkGroup[] {
  const productLinks = products
    .filter((product) => product.hasDetails)
    .map((product) => ({
      label: product.title,
      href: `/products/${product.slug}`,
    }));
  const resolvedProductLinks =
    productLinks.length > 0
      ? productLinks
      : [
          {
            label: footerLabels.viewProducts,
            href: "/products",
          },
        ];

  return [
    createFooterLinkGroup(footerLabels.navigation, navigationLinks),
    {
      title: footerLabels.products,
      links: resolvedProductLinks,
    },
    createFooterLinkGroup(
      "Policies",
      policies.map((policy) => ({ label: policy.title, href: policy.href })),
    ),
  ].filter((group): group is FooterLinkGroup => Boolean(group));
}

function createFooterLinkGroup(
  title: string,
  links: FooterLinkItem[],
): FooterLinkGroup | undefined {
  if (links.length === 0) {
    return undefined;
  }

  return {
    title,
    links,
  };
}
