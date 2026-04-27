import type { Metadata } from "next";
import { ContentBoxes } from "@/components/page-components/home/content-boxes";
import { Hero } from "@/components/page-components/home/hero";
import { LargeImageSection } from "@/components/page-components/shared/large-image-section";
import { ProcessSteps } from "@/components/page-components/home/process-steps";
import { QuoteBlock } from "@/components/page-components/home/quote-block";
import { TextContentBlock } from "@/components/page-components/shared/text-content-block";
import { getBrandData } from "@/data/loaders/brand-loader";
import { getHomePageData } from "@/data/loaders/home";
import {
  hasImageAsset,
  hasQuoteContent,
  hasTextContentBlockContent,
} from "@/data/predicates";
import { buildPageTitle, createMetadata, resolvePageSeo } from "@/lib/seo";
import { Container, Separator } from "@chakra-ui/react";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandData();
  const homePageData = await getHomePageData();
  const seo = resolvePageSeo({
    seo: homePageData.seo,
    fallbackTitle: buildPageTitle(),
    fallbackDescriptionParts: [
      homePageData.hero.subtitle,
      homePageData.textContentBlock1.text1,
      brand.slogan,
    ],
  });

  return createMetadata({
    title: seo.title,
    description: seo.description,
    path: "/",
    image:
      homePageData.largeImage?.src ||
      homePageData.hero.backgroundImage ||
      "/logo_horizontal.png",
  });
}

export default async function Home() {
  const brand = await getBrandData();
  const homePageData = await getHomePageData();
  const hasTextContentBlock1 = hasTextContentBlockContent(
    homePageData.textContentBlock1,
  );
  const hasContentBoxes = homePageData.contentBoxes.length > 0;
  const largeImage = homePageData.largeImage;
  const hasLargeImage = hasImageAsset(largeImage);
  const hasTextContentBlock2 = hasTextContentBlockContent(
    homePageData.textContentBlock2,
  );
  const hasProcessSteps = homePageData.processSteps.length > 0;
  const hasQuote = hasQuoteContent(homePageData.quote);

  return (
    <>
      <Hero
        {...homePageData.hero}
        title={homePageData.hero.title || brand.name}
        subtitle={homePageData.hero.subtitle || brand.slogan}
      />
      <Separator />
      <Container>
        {hasTextContentBlock1 ? (
          <TextContentBlock {...homePageData.textContentBlock1} />
        ) : null}
        {hasContentBoxes ? <ContentBoxes items={homePageData.contentBoxes} /> : null}
        {hasLargeImage ? <Separator /> : null}

        {hasLargeImage ? (
          <LargeImageSection image={largeImage} />
        ) : null}
        {hasTextContentBlock2 || hasProcessSteps ? <Separator /> : null}
        {hasTextContentBlock2 ? (
          <TextContentBlock {...homePageData.textContentBlock2} />
        ) : null}
        {hasProcessSteps ? <ProcessSteps steps={homePageData.processSteps} /> : null}
        {hasQuote ? <Separator /> : null}
        {hasQuote ? <QuoteBlock data={homePageData.quote} /> : null}
      </Container>
    </>
  );
}
