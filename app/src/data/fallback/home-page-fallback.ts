import type { ContentBoxItem } from "@/components/page-components/home/content-boxes";
import type { ProcessStepItem } from "@/components/page-components/home/process-steps";
import type { QuoteBlockData } from "@/components/page-components/home/quote-block";
import type { HomeHeroData } from "@/types/home";
import type {
  ProductMediaAsset,
  ProductsTextContentBlockData,
} from "@/types/products";
import { homeHeroCtaContent } from "@/data/contents/home-hero-cta";

// hero: HomeHeroData
export const homeHeroFallbackData: HomeHeroData = {
  backgroundImage: "",
  title: "",
  subtitle: "",
  ...homeHeroCtaContent,
};

// textContentBlock1: ProductsTextContentBlockData
export const homeTextContentBlock1FallbackData: ProductsTextContentBlockData = {
  thoughtTitle: "",
  mainTitle: "",
  text1: "",
  text2: "",
};

// contentBoxes: ContentBoxItem[]
export const homeContentBoxesFallbackData: ContentBoxItem[] = [];

// largeMedia1?: ProductMediaAsset
export const homeLargeMedia1FallbackData: ProductMediaAsset = {
  type: "image",
  src: "",
  alt: "",
};

// largeMedia2?: ProductMediaAsset
export const homeLargeMedia2FallbackData: ProductMediaAsset = {
  type: "image",
  src: "",
  alt: "",
};

// textContentBlock2: ProductsTextContentBlockData
export const homeTextContentBlock2FallbackData: ProductsTextContentBlockData = {
  thoughtTitle: "",
  mainTitle: "",
  text1: "",
  text2: "",
};

// processSteps: ProcessStepItem[]
export const homeProcessStepsFallbackData: ProcessStepItem[] = [];

// quote: QuoteBlockData
export const homeQuoteFallbackData: QuoteBlockData = {
  quote: "",
  author: "",
  subtitle: "",
};
