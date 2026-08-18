import type { ProductSummary } from "@/types/products";

export const productBasicMockData: ProductSummary[] = [
  {
    slug: "signature-tube-amplifier",
    merchandiseId: "gid://shopify/ProductVariant/mock-signature-tube-amplifier",
    hasDetails: true,
    availableForSale: true,
    categoryLabel: "Amplifiers",
    title: "Signature Tube Amplifier",
    subtitle: "Pure analog warmth meets modern precision",
    description:
      "Handcrafted vacuum tube amplifier delivering 50W of pristine Class-A power with a studio-ready feature set.",
    price: "$4,500",
    priceSubtitle: "USD",
    image: {
      src: "/window.svg",
      alt: "Signature Tube Amplifier",
    },
    specs: [
      { label: "Power Output", value: "50W Class-A" },
      { label: "Tubes", value: "4x EL34, 4x 12AX7" },
      { label: "Response", value: "10Hz - 45kHz" },
    ],
  },
  {
    slug: "reference-monitor-controller",
    merchandiseId: "gid://shopify/ProductVariant/mock-reference-monitor-controller",
    hasDetails: true,
    availableForSale: true,
    categoryLabel: "Controllers",
    title: "Reference Monitor Controller",
    subtitle: "Analog control for critical listening",
    description:
      "A mastering-grade monitor controller with relay switching, stepped attenuation, and multiple speaker outputs.",
    price: "$2,200",
    priceSubtitle: "USD",
    image: {
      src: "/globe.svg",
      alt: "Reference Monitor Controller",
    },
    specs: [
      { label: "Inputs", value: "3 stereo" },
      { label: "Outputs", value: "3 speaker pairs" },
      { label: "Attenuation", value: "Relay stepped" },
    ],
  },
];

export const productBasicDataBySlug: Record<string, ProductSummary> =
  Object.fromEntries(productBasicMockData.map((product) => [product.slug, product]));
