import type {
  ShopifyMediaImageReference,
  ShopifyMetaobjectField,
  ShopifyReference,
  ShopifyScalarMetaobjectField,
} from "@/types/shopify";
import type { PageSeo } from "@/types/seo";
import { seoMetaobjectFieldKeys } from "@/data/shopify/metaobjects/seo";

export function getMetaobjectTextValue(
  fields: Array<{
    key: string;
    value: string | null;
  }>,
  key: string,
): string | undefined {
  return fields.find((field) => field.key === key)?.value ?? undefined;
}

export function mapPageSeo(
  fields: ShopifyScalarMetaobjectField[] | undefined,
): PageSeo | undefined {
  if (!fields?.length) {
    return undefined;
  }

  const title = getMetaobjectTextValue(fields, seoMetaobjectFieldKeys.title)?.trim();
  const description = getMetaobjectTextValue(
    fields,
    seoMetaobjectFieldKeys.description,
  )?.trim();

  if (!title && !description) {
    return undefined;
  }

  return {
    title: title || undefined,
    description: description || undefined,
  };
}

export function parseStringList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function getFieldReference(
  fields: ShopifyMetaobjectField[],
  keys: readonly string[],
): ShopifyReference | undefined {
  return fields.find((field) => keys.includes(field.key))?.reference ?? undefined;
}

export function getMetaobjectFields(
  fields: ShopifyMetaobjectField[],
  keys: readonly string[],
): ShopifyScalarMetaobjectField[] | undefined {
  const reference = getFieldReference(fields, keys);

  if (!reference || reference.__typename !== "Metaobject") {
    return undefined;
  }

  return reference.fields;
}

export function getMediaImageReference(
  fields: ShopifyMetaobjectField[],
  keys: readonly string[],
): ShopifyMediaImageReference | undefined {
  const reference = getFieldReference(fields, keys);

  if (!reference || reference.__typename !== "MediaImage") {
    return undefined;
  }

  return reference;
}

export function getMetaobjectFieldReference<TReference extends { __typename: string }>(
  fields: ShopifyMetaobjectField[] | ShopifyScalarMetaobjectField[],
  key: string,
  typename: TReference["__typename"],
): TReference | undefined {
  const field = fields.find((item) => item.key === key) as
    | ShopifyMetaobjectField
    | undefined;
  const reference = field?.reference;

  if (!reference || reference.__typename !== typename) {
    return undefined;
  }

  return reference as unknown as TReference;
}
