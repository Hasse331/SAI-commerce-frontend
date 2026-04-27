import type { ContactMethod } from "@/types/contact";
import type { PageSeo } from "@/types/seo";
import { isShopifyDataSource } from "../source";
import { contactMethodsFallbackData } from "../fallback/contact-fallback";
import { storefrontQuery } from "../shopify/storefront-client";
import { getMetaobjectFields, getMetaobjectTextValue, mapPageSeo } from "../mappers";
import { normalizeContactMethods } from "../predicates";
import {
  contactFieldKeys,
  shopifySharedMetaobjects,
} from "../shopify/metaobjects/shared";
import { seoMetaobjectFieldKeys } from "../shopify/metaobjects/seo";
import type { ShopifyMetaobjectField } from "@/types/shopify";

interface ShopifySharedContactQueryData {
  metaobject: {
    fields: ShopifyMetaobjectField[];
  } | null;
}

export interface SharedContactData {
  contactMethods: ContactMethod[];
  seo?: PageSeo;
}

const sharedContactQuery = `
  query SharedContact($handle: String!) {
    metaobject(handle: { type: "${shopifySharedMetaobjects.contact.type}", handle: $handle }) {
      fields {
        key
        value
        type
        reference {
          __typename
          ... on Metaobject {
            fields {
              key
              value
              type
            }
          }
        }
      }
    }
  }
`;

export async function getContactMethodsData(): Promise<ContactMethod[]> {
  return (await getSharedContactData()).contactMethods;
}

export async function getSharedContactData(): Promise<SharedContactData> {
  if (!isShopifyDataSource()) {
    return {
      contactMethods: normalizeContactMethods(contactMethodsFallbackData),
    };
  }

  const data = await storefrontQuery<ShopifySharedContactQueryData>(
    sharedContactQuery,
    {
      handle: shopifySharedMetaobjects.contact.handle,
    },
  );

  if (!data.metaobject) {
    return {
      contactMethods: normalizeContactMethods(contactMethodsFallbackData),
    };
  }

  const email = getMetaobjectTextValue(data.metaobject.fields, contactFieldKeys.email);
  const phone = getMetaobjectTextValue(data.metaobject.fields, contactFieldKeys.phone);
  const address = getMetaobjectTextValue(
    data.metaobject.fields,
    contactFieldKeys.address,
  );

  const items: ContactMethod[] = [];

  if (email) {
    items.push({
      label: "Email",
      value: email,
      detail: "Best for project discussions and general inquiries",
    });
  }

  if (phone) {
    items.push({
      label: "Phone",
      value: phone,
      detail: "Available on weekdays during studio hours",
    });
  }

  if (address) {
    items.push({
      label: "Address",
      value: address,
      detail: "Visits and demos by appointment",
    });
  }

  return {
    contactMethods:
      items.length > 0
        ? normalizeContactMethods(items)
        : normalizeContactMethods(contactMethodsFallbackData),
    seo: mapPageSeo(
      getMetaobjectFields(data.metaobject.fields, seoMetaobjectFieldKeys.reference),
    ),
  };
}
