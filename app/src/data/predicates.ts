import type { QuoteBlockData } from "@/components/page-components/home/quote-block";
import type { ContactMethod } from "@/types/contact";
import type {
  ProductImageAsset,
  ProductMediaAsset,
  ProductsTextContentBlockData,
} from "@/types/products";

export function hasTextContentBlockContent(
  block: ProductsTextContentBlockData | undefined,
): boolean {
  if (!block) {
    return false;
  }

  return Boolean(
    block.thoughtTitle || block.mainTitle || block.text1 || block.text2,
  );
}

export function hasImageAsset(
  image: ProductImageAsset | undefined,
): image is ProductImageAsset {
  return Boolean(image?.src);
}

export function hasMediaAsset(
  media: ProductMediaAsset | undefined,
): media is ProductMediaAsset {
  return Boolean(media?.src);
}

export function hasQuoteContent(data: QuoteBlockData | undefined): boolean {
  return Boolean(data?.quote && data.author);
}

export function normalizeContactMethods(
  items: ContactMethod[],
): ContactMethod[] {
  return items.filter((item) => Boolean(item.label && item.value));
}
