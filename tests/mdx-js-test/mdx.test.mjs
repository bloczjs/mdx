import test from "ava";
import { compile } from "@mdx-js/mdx";

import detectImportsPlugin from "@blocz/mdx-plugin-detect-imports";

test("it works with @mdx-js/mdx", async (t) => {
    const file = `import { Tabs, Button as ButtonElement } from "./elements";

## Hello MDX

1. First item
2. Second item

<ButtonElement variant="blue" label="Label" />`;

    const vFile = await compile(file, {
        remarkPlugins: [detectImportsPlugin],
    });

    t.truthy(
        vFile.value.includes(
            `export const importStatements = [{
  module: "./elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: ButtonElement
  }]
}];
`,
        ),
    );
});

test("it works with @mdx-js/mdx and a custom name", async (t) => {
    const file = `import { Tabs, Button as ButtonElement } from "./elements";

## Hello MDX

1. First item
2. Second item

<ButtonElement variant="blue" label="Label" />`;

    const vFile = await compile(file, {
        remarkPlugins: [[detectImportsPlugin, { exportName: "otherName" }]],
    });

    t.truthy(
        vFile.value.includes(
            `export const otherName = [{
  module: "./elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: ButtonElement
  }]
}];
`,
        ),
    );
});
