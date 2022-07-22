import { compile } from "@mdx-js/mdx";
import plugin from "@blocz/mdx-plugin-detect-imports";
import test from "ava";

const mdxText = `
import hello, { useFunction } from '@blocz/lib';
import { Tabs, Button } from '@blocz/elements';
import * as foo from '@blocz/foo';

### How it works

1. First item
2. Second item

---

### TL;DR

- First item
- Second item
- Nested list
    - First nested \`item\`
    - Second _nested_ item
    - **Third** nested item

---

export const label = "Click Me!";

export const props = {
    label,
    onClick: () => alert('Hello there!')
}

<Button
    variant="blue"
    label={label}
    {...props}
/>

    <Button
        label={label}
        {...props}
    />

`;

const defaultImportStatements = `
export const importStatements = [{
  module: "@blocz/lib",
  imports: [{
    kind: "default",
    local: "hello",
    value: hello
  }, {
    kind: "named",
    local: "useFunction",
    value: useFunction
  }]
}, {
  module: "@blocz/elements",
  imports: [{
    kind: "named",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    local: "Button",
    value: Button
  }]
}, {
  module: "@blocz/foo",
  imports: [{
    kind: "namespace",
    local: "foo",
    value: foo
  }]
}];
`;

test("injects the right importStatements variable", async (t) => {
    const jsx = (
        await compile(mdxText, {
            remarkPlugins: [plugin],
        })
    ).value;
    t.snapshot(jsx);
    t.truthy(jsx.includes(defaultImportStatements));
});
test("allows for otherNames than 'importStatements'", async (t) => {
    const jsx = (
        await compile(mdxText, {
            remarkPlugins: [[plugin, { exportName: "otherName" }]],
        })
    ).value;
    t.truthy(
        jsx.includes(
            defaultImportStatements.replace("importStatements", "otherName"),
        ),
    );
});
