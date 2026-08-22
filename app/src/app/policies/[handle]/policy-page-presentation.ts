import type { SystemStyleObject } from "@chakra-ui/react";

export interface PolicyArticlePresentation {
  headingId: string;
  articleLabelledBy: string;
  styles: SystemStyleObject;
}

export function getPolicyArticlePresentation(): PolicyArticlePresentation {
  return {
    headingId: "policy-page-title",
    articleLabelledBy: "policy-page-title",
    styles: {
      "& h2": {
        fontSize: { base: "xl", md: "2xl" },
        fontWeight: "semibold",
        mt: { base: 8, md: 10 },
        mb: 4,
      },
      "& h3": {
        fontSize: { base: "lg", md: "xl" },
        fontWeight: "semibold",
        mt: { base: 6, md: 8 },
        mb: 3,
      },
      "& p": { mb: { base: 4, md: 5 } },
      "& ul, & ol": {
        pl: { base: 6, md: 8 },
        mb: { base: 4, md: 5 },
      },
      "& ul": { listStyleType: "disc" },
      "& ol": { listStyleType: "decimal" },
      "& li": { mb: 2 },
      "& a": {
        color: "accentBright",
        textDecoration: "underline",
        textUnderlineOffset: "0.16em",
      },
      "& a:focus-visible": {
        outline: "2px solid",
        outlineColor: "accentBright",
        outlineOffset: "3px",
        borderRadius: "sm",
      },
    },
  };
}
