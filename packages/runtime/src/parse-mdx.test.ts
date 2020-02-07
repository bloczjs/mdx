import { parseMDX } from "./parse-mdx";

describe("Parse MDX", () => {
    it("Parse everything", async () => {
        const parsed = await parseMDX(`
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
`);
        expect(parsed.constants).toEqual({
            label: `const label = "Click Me!"`,
            props: `const props = {
 label,
 onClick: () => { return alert('Hello there!'); }
}`,
        });
        expect(parsed.filteredText).toEqual(`

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
</div> -->`);
        expect(parsed.importDeclarations).toEqual([
            {
                imports: [
                    {
                        imported: "useFunction",
                        local: "useFunction",
                    },
                ],
                module: "@blocz/lib",
            },
            {
                imports: [
                    {
                        imported: "Tabs",
                        local: "Tabs",
                    },
                    {
                        imported: "Button",
                        local: "Button",
                    },
                ],
                module: "@blocz/elements",
            },
        ]);
    });
});
