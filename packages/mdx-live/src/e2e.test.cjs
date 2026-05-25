const test = require("node:test");
const assert = require("node:assert/strict");

test("@blocz/mdx-live works with CJS", async () => {
    const { MDX, useMDX } = await import("@blocz/mdx-live");

    assert.ok(MDX);
    assert.ok(useMDX);
});
