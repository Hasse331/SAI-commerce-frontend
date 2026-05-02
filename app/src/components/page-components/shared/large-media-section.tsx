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
      rounded="3xl"
      p={{ base: 6, md: 10 }}
      minH={{ base: "340px", md: "560px" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {media.type === "image" ? (
        <Image
          src={media.src}
          alt={media.alt}
          w="full"
          h="full"
          maxH={{ base: "320px", md: "540px" }}
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
            height: "100%",
            maxHeight: "540px",
            objectFit: "contain",
          }}
        >
          <source src={media.src} type={media.mimeType} />
        </video>
      )}
    </Box>
  );
}
