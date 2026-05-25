import test from "node:test";
import assert from "node:assert/strict";

import { MDX, useMDX } from "@blocz/mdx-live";

test("@blocz/mdx-live works with MJS", () => {
    assert.ok(MDX);
    assert.ok(useMDX);
});
