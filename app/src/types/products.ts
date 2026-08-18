import type { PageSeo } from "@/types/seo";

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductImageAsset {
  src: string;
  alt: string;
}

export interface ProductVideoAsset {
  type: "video";
  src: string;
  alt: string;
  poster?: string;
  mimeType?: string;
}

export type ProductMediaAsset =
  | ({ type: "image" } & ProductImageAsset)
  | ProductVideoAsset;

export interface ProductSummary {
  slug: string;
  merchandiseId?: string;
  hasDetails: boolean;
  availableForSale: boolean;
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  image: ProductImageAsset;
  price: string;
  priceSubtitle: string;
  specs: ProductSpecItem[];
}

export interface ProductsTextContentBlockData {
  thoughtTitle?: string;
  mainTitle?: string;
  text1?: string;
  text2?: string;
}

export interface ProductsPageData {
  seo?: PageSeo;
  textContentBlock: ProductsTextContentBlockData;
  items: ProductSummary[];
}

export interface ProductSpecsSectionData {
  title?: string;
  image?: ProductImageAsset;
  specs: ProductSpecItem[];
}

export interface ProductHighlightsSectionData {
  title: string;
  items: string[];
}

export interface ProductImageSpecsSectionData {
  title?: string;
  image: ProductImageAsset;
  specs: ProductSpecItem[];
  layout: "horizontal" | "vertical";
}

export interface ProductCustomizationOption {
  label: string;
  active?: boolean;
}

export interface ProductCustomizationOptionGroup {
  title: string;
  options: ProductCustomizationOption[];
}

export interface ProductCustomizationSectionData {
  title: string;
  image: ProductImageAsset;
  optionGroups: ProductCustomizationOptionGroup[];
}

export interface ProductDetailContentData {
  slug: string;
  heroImage: ProductImageAsset;
  textContentBlock?: ProductsTextContentBlockData;
  textContentBlock2?: ProductsTextContentBlockData;
  largeImage?: ProductImageAsset;
  largeImage2?: ProductImageAsset;
  keySpecs?: ProductSpecsSectionData;
  highlights?: ProductHighlightsSectionData;
  imageSpecsSections: ProductImageSpecsSectionData[];
}

export interface ProductDetailPageData {
  seo?: PageSeo;
  product: ProductSummary;
  detail: ProductDetailContentData;
  customization?: ProductCustomizationSectionData;
  ctaLabel: string;
}
