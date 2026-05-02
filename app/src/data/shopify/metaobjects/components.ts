export const textContentBlockFieldKeys = {
  thoughtTitle: ["thought_title", "tought_title"],
  mainTitle: "main_title",
  text1: "text1",
  text2: "text2",
} as const;

export const homeComponentFieldKeys = {
  titles: "titles",
  texts: "texts",
  titleList: "title",
  textList: "text",
  quoteBody: "quote",
  quoteAuthor: "author",
  quoteAuthorTitle: "author_title",
} as const;

export const productComponentFieldKeys = {
  cardSpecDescription: "spec_description",
  cardSpecDetail: "spec_detail",
  detailHeroImage: "large_hero_image",
  detailLargeImage: "large_media_1",
  detailLargeImage2: "large_media_2",
  detailKeySpecs: "key_specs",
  detailHighlights: "highlights",
  detailTextContent: "chosen_text_contents",
  detailTextContent2: "chosen_text_contents_2",
  horizontalImageSpecs: "image_specs_horizontal",
  verticalImageSpecs: "image_specs_vertical",
  imageSpecsImage: "large_image",
  imageSpecsTitles: "specs_titles",
  imageSpecsTexts: "specs_text",
} as const;
