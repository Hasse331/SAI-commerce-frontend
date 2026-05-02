import { Box, Image } from "@chakra-ui/react";
import type { ProductMediaAsset } from "@/types/products";

interface LargeMediaSectionProps {
  media: ProductMediaAsset;
}

export function LargeMediaSection({ media }: LargeMediaSectionProps) {
  if (!media.src) {
    return null;
  }

  return (
    <Box
      as="section"
      w="100vw"
      maxW="100vw"
      marginInline="calc(50% - 50vw)"
      rounded="none"
      p={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {media.type === "image" ? (
        <Image
          src={media.src}
          alt={media.alt}
          w="full"
          h="auto"
          display="block"
          maxH={{ base: "none", md: "80vh" }}
          objectFit="contain"
        />
      ) : (
        <video
          poster={media.poster}
          aria-label={media.alt}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        >
          <source src={media.src} type={media.mimeType} />
        </video>
      )}
    </Box>
  );
}
