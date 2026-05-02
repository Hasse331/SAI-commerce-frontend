import test from "node:test";
import assert from "node:assert/strict";

import {
  mapMediaReference,
  type ProductMediaAsset,
} from "./media.ts";

test("mapMediaReference maps a Shopify image reference to an image asset", () => {
  const media = mapMediaReference(
    {
      __typename: "MediaImage",
      image: {
        url: "https://cdn.example.com/amp.jpg",
        altText: "Amplifier front view",
      },
    },
    "Fallback alt",
  );

  assert.deepEqual<ProductMediaAsset | undefined>(media, {
    type: "image",
    src: "https://cdn.example.com/amp.jpg",
    alt: "Amplifier front view",
  });
});

test("mapMediaReference maps a Shopify video reference to a video asset", () => {
  const media = mapMediaReference(
    {
      __typename: "Video",
      alt: "Demo reel",
      previewImage: {
        url: "https://cdn.example.com/poster.jpg",
        altText: "Pedal demo poster",
      },
      sources: [
        {
          url: "https://cdn.example.com/demo.mp4",
          mimeType: "video/mp4",
          format: "mp4",
        },
      ],
    },
    "Fallback alt",
  );

  assert.deepEqual<ProductMediaAsset | undefined>(media, {
    type: "video",
    src: "https://cdn.example.com/demo.mp4",
    alt: "Demo reel",
    mimeType: "video/mp4",
    poster: "https://cdn.example.com/poster.jpg",
  });
});

test("mapMediaReference prefers an mp4 source when multiple video sources are available", () => {
  const media = mapMediaReference(
    {
      __typename: "Video",
      alt: "Shopify multi-source video",
      previewImage: null,
      sources: [
        {
          url: "https://cdn.example.com/demo.m3u8",
          mimeType: "application/x-mpegURL",
          format: "m3u8",
        },
        {
          url: "https://cdn.example.com/demo.mp4",
          mimeType: "video/mp4",
          format: "mp4",
        },
      ],
    },
    "Fallback alt",
  );

  assert.deepEqual<ProductMediaAsset | undefined>(media, {
    type: "video",
    src: "https://cdn.example.com/demo.mp4",
    alt: "Shopify multi-source video",
    mimeType: "video/mp4",
    poster: undefined,
  });
});
