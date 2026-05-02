import type { ContentBoxItem } from "@/components/page-components/home/content-boxes";
import type { ProcessStepItem } from "@/components/page-components/home/process-steps";
import type { QuoteBlockData } from "@/components/page-components/home/quote-block";
import type { PageSeo } from "@/types/seo";
import type {
  ProductMediaAsset,
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
  largeMedia1?: ProductMediaAsset;
  textContentBlock2: ProductsTextContentBlockData;
  largeMedia2?: ProductMediaAsset;
  processSteps: ProcessStepItem[];
  quote: QuoteBlockData;
}
