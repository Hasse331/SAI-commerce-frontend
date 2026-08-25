import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Box, Separator } from "@chakra-ui/react";
import { themeTokens } from "@/theme/tokens";

import { CartProvider } from "@/components/cart/cart-provider";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { hasArticlesContent } from "@/data/loaders/articles";
import { getBrandData } from "@/data/loaders/brand-loader";
import { getStorePolicies } from "@/data/loaders/policies";
import { buildPageTitle, getMetadataBase, isProductionSite } from "@/lib/seo";
import type { PolicyLink } from "@/types/policies";
import { getShopifyAnalyticsConfig } from "@/data/shopify/analytics/config";
import { ShopifyAnalyticsRuntime } from "@/data/shopify/analytics/runtime";
import { ConsentProvider } from "@/components/consent/consent-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: buildPageTitle(),
    template: "%s",
  },
  description:
    "Handcrafted audio instruments, studio hardware, and workshop notes from Spectrum Audio Instruments.",
  applicationName: "Spectrum Audio Instruments",
  category: "audio equipment",
  keywords: [
    "audio instruments",
    "studio hardware",
    "handcrafted audio",
    "boutique audio",
    "effect pedals",
    "tube amplifiers",
  ],
  authors: [{ name: "Spectrum Audio Instruments" }],
  creator: "Spectrum Audio Instruments",
  publisher: "Spectrum Audio Instruments",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Spectrum Audio Instruments",
    url: "/",
    title: buildPageTitle(),
    description:
      "Handcrafted audio instruments, studio hardware, and workshop notes from Spectrum Audio Instruments.",
    images: [
      {
        url: "/logo_horizontal.png",
        alt: "Spectrum Audio Instruments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: buildPageTitle(),
    description:
      "Handcrafted audio instruments, studio hardware, and workshop notes from Spectrum Audio Instruments.",
    images: ["/logo_horizontal.png"],
  },
  robots: {
    index: isProductionSite(),
    follow: isProductionSite(),
    googleBot: {
      index: isProductionSite(),
      follow: isProductionSite(),
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hasArticles, brand, policies] = await Promise.all([
    hasArticlesContent(),
    getBrandData(),
    getStorePolicies(),
  ]);
  const policyLinks: PolicyLink[] = policies.map(({ handle, title, href }) => ({
    handle,
    title,
    href,
  }));
  const analyticsConfig = getShopifyAnalyticsConfig();
  const shell = (
    <Provider>
      <ConsentProvider>
        <Box
        maxW={themeTokens.layoutWidth}
        mx="auto"
        w="full"
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <CartProvider policyLinks={policyLinks}>
          <Header hasArticles={hasArticles} brand={brand} />
          <Separator />
          <Box as="main" flex="1">
            {children}
          </Box>
          <Separator />
          <Footer brand={brand} />
          <CartSidebar />
        </CartProvider>
        </Box>
      </ConsentProvider>
    </Provider>
  );

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable}`}
      >
        {shell}
        {analyticsConfig ? <ShopifyAnalyticsRuntime config={analyticsConfig} /> : null}
      </body>
    </html>
  );
}
