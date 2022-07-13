import test from "ava";

import { MDX, useMDX } from "@blocz/mdx-live";

test("@blocz/mdx-live works with MJS", (t) => {
    t.truthy(MDX);
    t.truthy(useMDX);
});
