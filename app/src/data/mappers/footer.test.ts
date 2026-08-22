import assert from "node:assert/strict";
import test from "node:test";
import { footerLabels } from "@/data/contents/footer-labels";
import { buildFooterLinkGroups } from "./footer";

test("footer adds available policies in provider order", () => {
  const groups = buildFooterLinkGroups({
    navigationLinks: [{ label: "Contact", href: "/contact" }],
    products: [],
    policies: [
      { handle: "privacy", title: "Privacy policy", href: "/policies/privacy" },
      { handle: "terms", title: "Terms of service", href: "/policies/terms" },
    ],
  });

  assert.deepEqual(groups, [
    {
      title: footerLabels.navigation,
      links: [{ label: "Contact", href: "/contact" }],
    },
    {
      title: footerLabels.products,
      links: [{ label: footerLabels.viewProducts, href: "/products" }],
    },
    {
      title: "Policies",
      links: [
        { label: "Privacy policy", href: "/policies/privacy" },
        { label: "Terms of service", href: "/policies/terms" },
      ],
    },
  ]);
});

test("footer omits the policies group when no policies are available", () => {
  const groups = buildFooterLinkGroups({
    navigationLinks: [],
    products: [],
    policies: [],
  });

  assert.equal(groups.some((group) => group.title === "Policies"), false);
});
