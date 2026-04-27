import type { ContentBoxItem } from "@/components/page-components/home/content-boxes";
import type { ProcessStepItem } from "@/components/page-components/home/process-steps";
import type { QuoteBlockData } from "@/components/page-components/home/quote-block";
import type { PageSeo } from "@/types/seo";
import type {
  ProductImageAsset,
  ProductsTextContentBlockData,
} from "@/types/products";

export interface HomeHeroData {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export interface HomePageData {
  seo?: PageSeo;
  hero: HomeHeroData;
  textContentBlock1: ProductsTextContentBlockData;
  contentBoxes: ContentBoxItem[];
  largeImage?: ProductImageAsset;
  textContentBlock2: ProductsTextContentBlockData;
  processSteps: ProcessStepItem[];
  quote: QuoteBlockData;
}
