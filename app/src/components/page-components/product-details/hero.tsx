import { Box, Heading, Image, Stack } from "@chakra-ui/react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ContactCtaButton } from "@/components/cart/contact-cta-button";
import type { ProductImageAsset, ProductSummary } from "@/types/products";

interface HeroProps {
  product: ProductSummary;
  image: ProductImageAsset;
  ctaLabel: string;
}

export function Hero({ product, image, ctaLabel }: HeroProps) {
  return (
    <Stack gap={{ base: 6, md: 8 }} align="center">
      <Heading as="h1" size="4xl" textAlign="center">
        {product.title}
      </Heading>

      <Box
        w="full"
        rounded="3xl"
        p={{ base: 2, md: 4 }}
        minH={{ base: "360px", md: "720px", xl: "820px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image
          src={image.src}
          alt={image.alt}
          w="full"
          h="full"
          maxH={{ base: "340px", md: "700px", xl: "800px" }}
          objectFit="contain"
        />
      </Box>

      {product.availableForSale && product.merchandiseId ? (
        <AddToCartButton
          merchandiseId={product.merchandiseId}
          label={ctaLabel}
        />
      ) : (
        <ContactCtaButton />
      )}
    </Stack>
  );
}
