const loader = require("./loader");

const mdx = `
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

describe("MDX loader", () => {
    it("injects the right importStatements variable", async () => {
        const importStatements = `[
    {
        module: "@blocz/lib",
        imports: [
            {
                imported: "useFunction",
                local: "useFunction",
                value: useFunction
            }
        ]
    }, {
        module: "@blocz/elements",
        imports: [
            {
                imported: "Tabs",
                local: "Tabs",
                value: Tabs
            }, {
                imported: "Button",
                local: "Button",
                value: Button
            }
        ]
    }
]`;
        const call = () =>
            new Promise(res => {
                const caller = {
                    async: () => (_, value) => res(value),
                };
                loader.call(caller, mdx);
            });
        expect(await call()).toContain(importStatements);
    });
});
