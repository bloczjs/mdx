const test = require("ava");

test("@blocz/mdx-live works with CJS", async (t) => {
    const { MDX, useMDX } = await import("@blocz/mdx-live");

    t.truthy(MDX);
    t.truthy(useMDX);
});
