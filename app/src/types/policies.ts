export interface PolicyLink {
  handle: string;
  title: string;
  href: string;
}

export interface StorePolicy extends PolicyLink {
  bodyHtml: string;
}
