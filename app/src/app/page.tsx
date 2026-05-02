import type { Metadata } from "next";
import { ContentBoxes } from "@/components/page-components/home/content-boxes";
import { Hero } from "@/components/page-components/home/hero";
import { LargeMediaSection } from "@/components/page-components/shared/large-media-section";
import { ProcessSteps } from "@/components/page-components/home/process-steps";
import { QuoteBlock } from "@/components/page-components/home/quote-block";
import { TextContentBlock } from "@/components/page-components/shared/text-content-block";
import { getBrandData } from "@/data/loaders/brand-loader";
import { getHomePageData } from "@/data/loaders/home";
import {
  hasMediaAsset,
  hasQuoteContent,
  hasTextContentBlockContent,
} from "@/data/predicates";
import { buildPageTitle, createMetadata, resolvePageSeo } from "@/lib/seo";
import { Container, Separator } from "@chakra-ui/react";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandData();
  const homePageData = await getHomePageData();
  const metadataImage =
    (homePageData.largeMedia1?.type === "image"
      ? homePageData.largeMedia1.src
      : homePageData.largeMedia1?.poster) ||
    (homePageData.largeMedia2?.type === "image"
      ? homePageData.largeMedia2.src
      : homePageData.largeMedia2?.poster);
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
      metadataImage ||
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
  const largeMedia1 = homePageData.largeMedia1;
  const hasLargeMedia1 = hasMediaAsset(largeMedia1);
  const hasTextContentBlock2 = hasTextContentBlockContent(
    homePageData.textContentBlock2,
  );
  const largeMedia2 = homePageData.largeMedia2;
  const hasLargeMedia2 = hasMediaAsset(largeMedia2);
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
        {hasContentBoxes ? (
          <ContentBoxes items={homePageData.contentBoxes} />
        ) : null}
        {hasLargeMedia1 ? <Separator mt={8} /> : null}

        {hasLargeMedia1 ? <LargeMediaSection media={largeMedia1} /> : null}
        {hasTextContentBlock2 || hasLargeMedia2 || hasProcessSteps ? (
          <Separator />
        ) : null}
        {hasTextContentBlock2 ? (
          <TextContentBlock {...homePageData.textContentBlock2} />
        ) : null}
        {hasLargeMedia2 ? <LargeMediaSection media={largeMedia2} /> : null}
        {hasProcessSteps ? (
          <ProcessSteps steps={homePageData.processSteps} />
        ) : null}
        {hasQuote ? <Separator /> : null}
        {hasQuote ? <QuoteBlock data={homePageData.quote} /> : null}
      </Container>
    </>
  );
}
