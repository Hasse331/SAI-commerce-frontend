import assert from "node:assert/strict";
import test from "node:test";
import { sanitizePolicyHtml } from "./sanitize-policy-html.ts";

test("policy HTML sanitizer preserves ordinary policy formatting and safe links", () => {
  const sanitized = sanitizePolicyHtml(
    '<h2>Returns</h2><p>Read <strong>carefully</strong> and <em>keep</em> your receipt.</p><ul><li><a href="https://example.com/returns">Returns</a></li><li><a href="mailto:support@example.com">Email us</a></li><li><a href="/shipping">Shipping</a></li></ul>',
  );

  assert.equal(
    sanitized,
    '<h2>Returns</h2><p>Read <strong>carefully</strong> and <em>keep</em> your receipt.</p><ul><li><a href="https://example.com/returns">Returns</a></li><li><a href="mailto:support@example.com">Email us</a></li><li><a href="/shipping">Shipping</a></li></ul>',
  );
});

test("policy HTML sanitizer removes executable content, unsafe URLs, and unsupported markup", () => {
  const sanitized = sanitizePolicyHtml(
    '<script>alert(1)</script><style>body{display:none}</style><iframe src="https://evil.example"></iframe><form action="/steal"><input></form><p onclick="alert(1)">Policy <a href="javascript:alert(1)" onmouseover="alert(1)">details</a><img src="x" onerror="alert(1)"></p>',
  );

  assert.equal(sanitized, '<p>Policy <a>details</a></p>');
});
