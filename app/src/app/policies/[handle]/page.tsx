import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Container, Heading } from "@chakra-ui/react";
import { getStorePolicy } from "@/data/loaders/policies";

type PolicyPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { handle } = await params;
  const policy = await getStorePolicy(handle);

  if (!policy) {
    return {};
  }

  return {
    title: policy.title,
    alternates: { canonical: policy.href },
    robots: { index: false, follow: true },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { handle } = await params;
  const policy = await getStorePolicy(handle);

  if (!policy) {
    notFound();
  }

  return (
    <Container maxW="container.md" py={{ base: 8, md: 12 }}>
      <Heading as="h1" size="2xl" mb={8}>
        {policy.title}
      </Heading>
      <Box
        as="article"
        lineHeight="tall"
        dangerouslySetInnerHTML={{ __html: policy.bodyHtml }}
      />
    </Container>
  );
}
