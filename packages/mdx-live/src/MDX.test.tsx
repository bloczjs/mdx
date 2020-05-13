import React from "react";
import { act, render } from "@testing-library/react";
import { MDX } from "./MDX";

const Button: React.FunctionComponent<{
    label: string;
    variant?: string;
    onClick?: React.MouseEventHandler;
}> = ({ label, variant, onClick }) => (
    <button data-variant={variant} onClick={onClick}>
        {label}
    </button>
);

const markdown = `
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
`;

const mdxWithoutImportStatement = `
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
`;

const mdxWithImportStatement = `
import { Button } from '@blocz/element';

${mdxWithoutImportStatement}
`;

const resolveImport = async (module: string, variable: string) => {
    if (module !== "@blocz/element") {
        return undefined;
    }
    if (variable !== "Button") {
        return undefined;
    }
    return Button;
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe("Render MDX", () => {
    it("render simple MD", async () => {
        await act(async () => {
            const { getAllByRole } = await render(<MDX code={markdown} />);
            await wait(10);
            expect(getAllByRole("heading")).toHaveLength(2);
            expect(getAllByRole("separator")).toHaveLength(2);
            expect(getAllByRole("listitem")).toHaveLength(8);
            expect(getAllByRole("list")).toHaveLength(3);
        });
    });
    it("render MDX with export statement", async () => {
        await act(async () => {
            const { container } = await render(
                <MDX
                    code={mdxWithoutImportStatement}
                    defaultScope={{ Button }}
                />,
            );
            await wait(10);
            expect(container.innerHTML).toBe(
                '<button data-variant="blue">Click Me!</button>',
            );
        });
    });
    it("render MDX with import statement", async () => {
        await act(async () => {
            const { container } = await render(
                <MDX
                    code={mdxWithImportStatement}
                    resolveImport={resolveImport}
                />,
            );
            await wait(10);
            expect(container.innerHTML).toBe(
                '<button data-variant="blue">Click Me!</button>',
            );
        });
    });
});
