import type { MetadataRoute } from "next";
import { getArticlesPageData } from "@/data/loaders/articles-page";
import { getStorePolicies } from "@/data/loaders/policies";
import { getProductsPageData } from "@/data/loaders/products-page";
import { getSiteUrl } from "@/lib/seo";
import type { PolicyLink } from "@/types/policies";

export function createPolicySitemapEntries(
  siteUrl: string,
  policies: PolicyLink[],
): MetadataRoute.Sitemap {
  return policies.map((policy) => ({ url: `${siteUrl}${policy.href}` }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
  const [productsPageData, articlesPageData, policies] = await Promise.all([
    getProductsPageData(),
    getArticlesPageData(),
    getStorePolicies(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const articleIndexRoute: MetadataRoute.Sitemap =
    articlesPageData.items.length > 0
      ? [
          {
            url: `${siteUrl}/articles`,
            changeFrequency: "weekly",
            priority: 0.8,
          },
        ]
      : [];

  const articleRoutes: MetadataRoute.Sitemap = articlesPageData.items.map(
    (article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = productsPageData.items
    .filter((product) => product.hasDetails)
    .map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [
    ...staticRoutes,
    ...articleIndexRoute,
    ...articleRoutes,
    ...productRoutes,
    ...createPolicySitemapEntries(siteUrl, policies),
  ];
}
