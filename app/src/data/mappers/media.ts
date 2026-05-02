import type {
  ProductImageAsset,
  ProductMediaAsset,
} from "@/types/products";
import type {
  ShopifyMediaImageReference,
  ShopifyMediaReference,
} from "@/types/shopify";

export function mapMediaImageReference(
  reference: ShopifyMediaImageReference | null | undefined,
  fallbackAlt: string,
): ProductImageAsset | undefined {
  const media = mapMediaReference(reference, fallbackAlt);

  if (!media || media.type !== "image") {
    return undefined;
  }

  return {
    src: media.src,
    alt: media.alt,
  };
}

export function mapMediaReference(
  reference: ShopifyMediaReference | null | undefined,
  fallbackAlt: string,
): ProductMediaAsset | undefined {
  if (!reference) {
    return undefined;
  }

  if (reference.__typename === "MediaImage") {
    const image = reference.image;

    if (!image?.url) {
      return undefined;
    }

    return {
      type: "image",
      src: image.url,
      alt: image.altText || fallbackAlt,
    };
  }

  const source =
    reference.sources.find((item) => item.mimeType === "video/mp4" && Boolean(item.url)) ||
    reference.sources.find((item) => item.format === "mp4" && Boolean(item.url)) ||
    reference.sources.find((item) => Boolean(item.url));

  if (!source?.url) {
    return undefined;
  }

  return {
    type: "video",
    src: source.url,
    alt: reference.alt || reference.previewImage?.altText || fallbackAlt,
    mimeType: source.mimeType || undefined,
    poster: reference.previewImage?.url || undefined,
  };
}

export type { ProductMediaAsset } from "@/types/products";
