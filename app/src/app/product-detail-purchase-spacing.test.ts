import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./products/[slug]/page.tsx", import.meta.url),
  "utf8",
);

test("the lower purchase button is centered evenly between separators", () => {
  assert.match(
    source,
    /<Separator\s*\/>\s*<Stack align="center">[\s\S]*?<\/Stack>\s*<Separator\s*\/>\s*<\/Stack>/,
  );
  assert.doesNotMatch(source, /<\/Stack>\s*<Separator\s*\/>\s*<\/Container>/);
});
