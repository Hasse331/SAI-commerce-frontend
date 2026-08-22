import sanitizeHtml from "sanitize-html";

const ALLOWED_POLICY_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "br",
];

export function sanitizePolicyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_POLICY_TAGS,
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
}
