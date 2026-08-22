import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Separator, SimpleGrid, Stack } from "@chakra-ui/react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ContactCtaButton } from "@/components/cart/contact-cta-button";
import { CustomizationCard } from "@/components/page-components/product-details/customization-card";
import { Hero } from "@/components/page-components/product-details/hero";
import { Highlights } from "@/components/page-components/product-details/highlights";
import { ImageSpecsSection } from "@/components/page-components/product-details/image-specs-section";
import { KeySpecs } from "@/components/page-components/product-details/key-specs";
import { LargeImage } from "@/components/page-components/product-details/large-image";
import { getProductDetailPageData } from "@/data/loaders/product-detail-page";
import { TextContentBlock } from "@/components/page-components/shared/text-content-block";
import { buildPageTitle, createMetadata, resolvePageSeo } from "@/lib/seo";

interface ProductDetailRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetailPageData(slug);

  if (!data) {
    return createMetadata({
      title: buildPageTitle("Product not found"),
      description: "The requested product could not be found.",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  const seo = resolvePageSeo({
    seo: data.seo,
    fallbackTitle: buildPageTitle(data.product.title),
    fallbackDescriptionParts: [
      data.product.subtitle,
      data.product.description,
      data.detail.textContentBlock?.text1,
    ],
  });

  return createMetadata({
    title: seo.title,
    description: seo.description,
    path: `/products/${data.product.slug}`,
    image: data.detail.heroImage.src || data.product.image.src,
  });
}

export default async function ProductDetailRoute({
  params,
}: ProductDetailRouteProps) {
  const { slug } = await params;
  const data = await getProductDetailPageData(slug);

  if (!data) {
    notFound();
  }

  const horizontalImageSpecsSection = data.detail.imageSpecsSections.find(
    (section) => section.layout === "horizontal",
  );
  const verticalImageSpecsSection = data.detail.imageSpecsSections.find(
    (section) => section.layout === "vertical",
  );
  const specsOverviewSections = [
    data.detail.keySpecs ? (
      <KeySpecs key="key-specs" section={data.detail.keySpecs} />
    ) : null,
    data.detail.highlights ? (
      <Highlights key="highlights" section={data.detail.highlights} />
    ) : null,
  ].filter(Boolean);
  const hasSpecsOverview =
    Boolean(data.detail.keySpecs) || Boolean(data.detail.highlights);
  const showCustomization =
    process.env.NODE_ENV === "development" && Boolean(data.customization);

  return (
    <Container maxW="8xl">
      <Stack gap={{ base: 16, md: 24 }} py={{ base: 10, md: 14 }}>
        <Hero
          product={data.product}
          image={data.detail.heroImage}
          ctaLabel={data.ctaLabel}
        />
        {data.detail.textContentBlock ? (
          <>
            <Separator />
            <TextContentBlock {...data.detail.textContentBlock} />
          </>
        ) : null}
        {data.detail.largeImage ? (
          <>
            <LargeImage image={data.detail.largeImage} />
          </>
        ) : null}

        {hasSpecsOverview ? (
          <>
            <Separator />
            {specsOverviewSections.length === 1 ? (
              <Stack w="full" maxW="5xl" mx="auto" align="center">
                {specsOverviewSections}
              </Stack>
            ) : (
              <SimpleGrid
                columns={{ base: 1, xl: 2 }}
                gap={6}
                w="full"
                maxW="5xl"
                mx="auto"
                justifyItems="center"
              >
                {specsOverviewSections}
              </SimpleGrid>
            )}
          </>
        ) : null}

        {showCustomization && data.customization ? (
          <>
            <Separator />
            <CustomizationCard section={data.customization} />
          </>
        ) : null}

        {horizontalImageSpecsSection ? (
          <>
            <Separator />
            <ImageSpecsSection section={horizontalImageSpecsSection} />
          </>
        ) : null}

        {data.detail.textContentBlock2 ? (
          <>
            <Separator />
            <TextContentBlock {...data.detail.textContentBlock2} />
          </>
        ) : null}

        {data.detail.largeImage2 ? (
          <>
            <LargeImage image={data.detail.largeImage2} />
          </>
        ) : null}

        {verticalImageSpecsSection ? (
          <>
            <Separator />
            <ImageSpecsSection section={verticalImageSpecsSection} />
          </>
        ) : null}

        <Stack align="center">
          {data.product.availableForSale && data.product.merchandiseId ? (
            <AddToCartButton
              merchandiseId={data.product.merchandiseId}
              label={data.ctaLabel}
            />
          ) : (
            <ContactCtaButton />
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
