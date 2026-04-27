import type { PageSeo } from "@/types/seo";

export interface ContactMethod {
  label: string;
  value: string;
  detail?: string;
}

export interface ContactPageData {
  seo?: PageSeo;
  eyebrow: string;
  title: string;
  intro: string;
  contactMethods: ContactMethod[];
}
