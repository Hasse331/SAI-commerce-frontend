import { contactPageIntroData } from "@/data/contents/contact-page-intro";
import { isShopifyDataSource } from "@/data/source";
import type { ContactPageData } from "@/types/contact";
import { getSharedContactData } from "./contact-methods";

export async function getContactPageData(): Promise<ContactPageData> {
  if (isShopifyDataSource()) {
    return getShopifyContactPageData();
  }

  return getContactPageIntroData();
}

function getContactPageIntroData(): ContactPageData {
  return contactPageIntroData;
}

async function getShopifyContactPageData(): Promise<ContactPageData> {
  const sharedContactData = await getSharedContactData();

  return {
    ...getContactPageIntroData(),
    contactMethods: sharedContactData.contactMethods,
    seo: sharedContactData.seo,
  };
}
