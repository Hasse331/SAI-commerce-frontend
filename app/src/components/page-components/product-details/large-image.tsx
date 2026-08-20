import { Box, Image } from "@chakra-ui/react";
import type { ProductImageAsset } from "@/types/products";

interface LargeImageProps {
  image: ProductImageAsset;
}

export function LargeImage({ image }: LargeImageProps) {
  if (!image.src) {
    return null;
  }

  return (
    <Box
      mx={{ base: -4, md: 0 }}
      rounded={{ base: "none", md: "3xl" }}
      p={{ base: 0, md: 4 }}
      minH={{ md: "760px", xl: "860px" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Image
        src={image.src}
        alt={image.alt}
        w="full"
        h={{ base: "auto", md: "full" }}
        maxH={{ md: "740px", xl: "840px" }}
        objectFit="contain"
      />
    </Box>
  );
}
