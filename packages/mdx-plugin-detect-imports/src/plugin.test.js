const mdx = require("@mdx-js/mdx");
const plugin = require("@blocz/mdx-plugin-detect-imports");

const mdxText = `
import { useFunction } from '@blocz/lib';
import { Tabs, Button } from '@blocz/elements';

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
    // this is a comment
    variant="blue"
    label={label}
    {...props}
/>

    <Button
        label={label}
        {...props}
    />


<!-- <div>
    I’m a div that’s not rendered
</div> -->
`;

describe("MDX plugin detect imports", () => {
    it("injects the right importStatements variable", async () => {
        const importStatements = `
export const importStatements = [{
  module: "@blocz/lib",
  imports: [{
    imported: "useFunction",
    local: "useFunction",
    value: useFunction
  }]
}, {
  module: "@blocz/elements",
  imports: [{
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    imported: "Button",
    local: "Button",
    value: Button
  }]
}];
`;
        const jsx = await mdx(mdxText, {
            remarkPlugins: [plugin],
        });
        expect(jsx).toContain(importStatements);
    });
});
