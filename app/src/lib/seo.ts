import type { Metadata } from "next";
import type { PageSeo } from "../types/seo";

const defaultSiteName = "Spectrum Audio Instruments";
const defaultDescription =
  "Handcrafted audio instruments, studio hardware, and workshop notes from Spectrum Audio Instruments.";
const defaultOgImage = "/logo_horizontal.png";
export const SEO_TITLE_MAX_LENGTH = 55;
export const SEO_DESCRIPTION_MAX_LENGTH = 150;

export function getSiteUrl(): URL {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

  try {
    return new URL(rawUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function getMetadataBase(): URL {
  return getSiteUrl();
}

export function isProductionSite(): boolean {
  return process.env.NODE_ENV === "production" && getSiteUrl().hostname !== "localhost";
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function normalizeImagePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return normalizePath(path);
}

export function buildPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${defaultSiteName}` : defaultSiteName;
}

function normalizeText(value?: string): string | undefined {
  const normalized = value?.replace(/\s+/g, " ").trim();

  return normalized || undefined;
}

function trimToLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength + 1).trim();
  const lastSpaceIndex = sliced.lastIndexOf(" ");

  if (lastSpaceIndex > Math.floor(maxLength * 0.6)) {
    return sliced.slice(0, lastSpaceIndex).trim();
  }

  return sliced.slice(0, maxLength).trim();
}

export function createTitle(...parts: Array<string | undefined>): string {
  const title = parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(" | ");

  return title || defaultSiteName;
}

export function createDescription(...parts: Array<string | undefined>): string {
  const description = parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(" ")

  return description || defaultDescription;
}

export function clampSeoTitle(title?: string): string {
  return trimToLength(normalizeText(title) || defaultSiteName, SEO_TITLE_MAX_LENGTH);
}

export function clampSeoDescription(description?: string): string {
  return trimToLength(
    normalizeText(description) || defaultDescription,
    SEO_DESCRIPTION_MAX_LENGTH,
  );
}

export function resolvePageSeo({
  seo,
  fallbackTitle,
  fallbackTitleParts = [],
  fallbackDescription,
  fallbackDescriptionParts = [],
}: {
  seo?: PageSeo;
  fallbackTitle?: string;
  fallbackTitleParts?: Array<string | undefined>;
  fallbackDescription?: string;
  fallbackDescriptionParts?: Array<string | undefined>;
}): Required<PageSeo> {
  const resolvedTitle =
    normalizeText(seo?.title) ||
    normalizeText(fallbackTitle) ||
    createTitle(...fallbackTitleParts);
  const resolvedDescription =
    normalizeText(seo?.description) ||
    normalizeText(fallbackDescription) ||
    createDescription(...fallbackDescriptionParts);

  return {
    title: clampSeoTitle(resolvedTitle),
    description: clampSeoDescription(resolvedDescription),
  };
}

export function createMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = defaultOgImage,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonicalPath = normalizePath(path);
  const imagePath = normalizeImagePath(image);
  const shouldIndex = !noIndex && isProductionSite();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: defaultSiteName,
      url: canonicalPath,
      title,
      description,
      images: [
        {
          url: imagePath,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
      },
    },
  };
}
