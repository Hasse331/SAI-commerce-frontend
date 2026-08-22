import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Container, Heading } from "@chakra-ui/react";
import { getStorePolicy } from "@/data/loaders/policies";
import { resolvePolicyPage } from "./policy-page";
import { getPolicyArticlePresentation } from "./policy-page-presentation";

type PolicyPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { handle } = await params;
  const resolvedPolicy = resolvePolicyPage(await getStorePolicy(handle));

  if (!resolvedPolicy) {
    return {};
  }

  return {
    title: resolvedPolicy.metadata.title,
    alternates: { canonical: resolvedPolicy.metadata.canonical },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { handle } = await params;
  const resolvedPolicy = resolvePolicyPage(await getStorePolicy(handle));

  if (!resolvedPolicy) {
    notFound();
  }

  const { policy } = resolvedPolicy;
  const articlePresentation = getPolicyArticlePresentation();

  return (
    <Container maxW="container.md" py={{ base: 8, md: 12 }}>
      <Box
        as="article"
        aria-labelledby={articlePresentation.articleLabelledBy}
        lineHeight="tall"
        css={articlePresentation.styles}
      >
        <Heading as="h1" id={articlePresentation.headingId} size="2xl" mb={8}>
          {policy.title}
        </Heading>
        <Box dangerouslySetInnerHTML={{ __html: policy.bodyHtml }} />
      </Box>
    </Container>
  );
}
