export const shopifyPageMetaobjects = {
  homePage: {
    type: "home_page",
  },
  productsPage: {
    type: "products_page",
    handle: "products-page",
  },
  productDetailsPage: {
    type: "product_details_page",
  },
} as const;

export const homePageFieldKeys = {
  heroImage: ["hero_image", "hero-image"],
  textContent1: ["text_content_block_1", "text-content-block-1"],
  contentBoxes: ["content_boxes", "content-boxes"],
  largeMedia1: ["large_media_1", "large-media-1"],
  textContent2: ["text_content_block_2", "text-content-block-2"],
  largeMedia2: ["large_media_2", "large-media-2"],
  processSteps: ["process_steps", "process-steps"],
  quote: ["quote"],
} as const;

export const productsPageFieldKeys = {
  introTextContentBlock: "products_intro_text_content_block",
  productsList: "products_list",
  product: "product",
  keySpecs: "key_specs",
} as const;

export const productDetailPageFieldKeys = {
  product: "product",
} as const;
