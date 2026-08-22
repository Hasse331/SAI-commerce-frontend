import assert from "node:assert/strict";
import test from "node:test";
import { getPolicyArticlePresentation } from "./policies/[handle]/policy-page-presentation";

test("policy article presentation supplies a named article and readable rich-text styles", () => {
  const presentation = getPolicyArticlePresentation();
  const styles = presentation.styles as Record<string, Record<string, unknown>>;

  assert.equal(presentation.headingId, "policy-page-title");
  assert.equal(presentation.articleLabelledBy, presentation.headingId);
  assert.deepEqual(styles["& h1"], {
    fontSize: { base: "lg", md: "xl" },
    fontWeight: "semibold",
    mt: { base: 8, md: 10 },
    mb: 4,
  });
  assert.deepEqual(styles["& h2"], {
    fontSize: { base: "md", md: "lg" },
    fontWeight: "semibold",
    mt: { base: 7, md: 9 },
    mb: 4,
  });
  assert.deepEqual(styles["& h3"], {
    fontSize: { base: "sm", md: "md" },
    fontWeight: "semibold",
    mt: { base: 6, md: 8 },
    mb: 3,
  });
  assert.deepEqual(styles["& h4"], {
    fontSize: "sm",
    fontWeight: "semibold",
    mt: { base: 5, md: 6 },
    mb: 2,
  });
  assert.deepEqual(styles["& h5"], {
    fontSize: "sm",
    fontWeight: "semibold",
    mt: { base: 4, md: 5 },
    mb: 2,
  });
  assert.deepEqual(styles["& h6"], {
    fontSize: "xs",
    fontWeight: "semibold",
    mt: { base: 4, md: 5 },
    mb: 2,
  });
  assert.deepEqual(styles["& p"], { mb: { base: 4, md: 5 } });
  assert.deepEqual(styles["& ul, & ol"], {
    pl: { base: 6, md: 8 },
    mb: { base: 4, md: 5 },
  });
  assert.equal(styles["& ul"].listStyleType, "disc");
  assert.equal(styles["& ol"].listStyleType, "decimal");
  assert.equal(styles["& li"].mb, 2);
  assert.equal(styles["& a"].textDecoration, "underline");
  assert.equal(styles["& a"].color, "accentBright");
  assert.deepEqual(styles["& a:focus-visible"], {
    outline: "2px solid",
    outlineColor: "accentBright",
    outlineOffset: "3px",
    borderRadius: "sm",
  });
});
