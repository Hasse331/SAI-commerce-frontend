export interface ShopifyScalarMetaobjectField {
  key: string;
  value: string | null;
  type: string;
  reference?: ShopifyReference | null;
}

export interface ShopifyMediaImageReference {
  __typename: "MediaImage";
  image: {
    url: string;
    altText: string | null;
  } | null;
}

export interface ShopifyVideoReference {
  __typename: "Video";
  alt: string | null;
  previewImage: {
    url: string;
    altText: string | null;
  } | null;
  sources: Array<{
    url: string;
    mimeType: string | null;
    format: string | null;
  }>;
}

export interface ShopifyProductReference {
  __typename: "Product";
  id?: string;
  handle: string;
  title: string;
}

export interface ShopifyMetaobjectReference {
  __typename: "Metaobject";
  id?: string;
  type?: string;
  handle?: string;
  fields: ShopifyScalarMetaobjectField[];
}

export type ShopifyMediaReference =
  | ShopifyMediaImageReference
  | ShopifyVideoReference;

export type ShopifyReference =
  | ShopifyMediaReference
  | ShopifyMetaobjectReference
  | ShopifyProductReference;

export interface ShopifyMetaobjectField {
  key: string;
  value: string | null;
  type: string;
  reference: ShopifyReference | null;
  references: {
    nodes: ShopifyProductNode[];
  } | null;
}

export interface ShopifyProductMetafield {
  type: string;
  value: string | null;
  reference: ShopifyMetaobjectReference | null;
}

export interface ShopifyProductNode {
  __typename: "Product";
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  productType: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  cardSpecsMetafield: ShopifyProductMetafield | null;
  subtitleMetafield: ShopifyProductMetafield | null;
}

export interface ShopifyMetaobjectNode {
  id?: string;
  type?: string;
  handle: string;
  fields: ShopifyMetaobjectField[];
}

export interface ShopifyProductsPageQueryData {
  metaobject: {
    id: string;
    type: string;
    handle: string;
    fields: ShopifyMetaobjectField[];
  } | null;
  detailPages: {
    nodes: ShopifyMetaobjectNode[];
  };
}

export interface ShopifyProductDetailPagesQueryData {
  detailPages: {
    nodes: ShopifyMetaobjectNode[];
  };
}
