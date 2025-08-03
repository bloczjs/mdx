import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import { useMDXComponents, MDXProvider } from "@mdx-js/react";
import { MDX } from "./MDX.js";
import type { ResolveImport } from "./MDX";
import test from "ava";

import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

test.afterEach.always("wipe out DOM", () => {
    cleanup();
});

const Button: React.FunctionComponent<{
    as?: string | React.ComponentType<any>;
    label: string;
    variant?: string;
    onClick?: React.MouseEventHandler;
}> = ({ label, variant, onClick, as: As = "button" }) => (
    <As data-variant={variant} onClick={onClick}>
        {label}
    </As>
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

export const InlineElement = (props) => <div {...props} />
export const AlternateButton = (props) => <div {...props} />;
export const AlternateInlineButton = (props) => <div {...props} />;


<Button
    variant="blue"
    label={label}
    {...props}
/>

<InlineElement>Hello</InlineElement>

<Button
    as={AlternateButton}
    variant="red"
    label={label}
    {...props}
/>

<AlternateInlineButton>World</AlternateInlineButton>
<Button
    as={AlternateInlineButton}
    variant="green"
    label={label}
    {...props}
/>
`;

const mdxWithImportStatement = `
import { Button } from '@blocz/element';

${mdxWithoutImportStatement}
`;

const resolveImport: ResolveImport = async (option) => {
    if (
        option.kind === "named" &&
        option.path === "@blocz/element" &&
        option.variable === "Button"
    ) {
        return Button;
    }

    return Button;
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

test.serial("render simple MD", async (t) => {
    const { getAllByRole } = render(<MDX code={markdown} />);
    await wait(16);
    t.is(2, getAllByRole("heading").length);
    t.is(2, getAllByRole("separator").length);
    t.is(8, getAllByRole("listitem").length);
    t.is(3, getAllByRole("list").length);
});

test.serial(
    "it enables the flag `providerImportSource` when `useMDXComponents` is passed",
    async (t) => {
        const { queryAllByRole, getAllByText } = render(
            <MDXProvider components={{ h3: () => <p>I AM A HEADER</p> }}>
                <MDX useMDXComponents={useMDXComponents} code={markdown} />
            </MDXProvider>,
        );
        await wait(16);

        t.is(0, queryAllByRole("heading").length);
        t.is(2, getAllByText("I AM A HEADER").length);
    },
);

test.serial("render MDX with export statement", async (t) => {
    const { container } = render(
        <MDX code={mdxWithoutImportStatement} defaultScope={{ Button }} />,
    );
    await wait(16);
    t.is(
        `<button data-variant="blue">Click Me!</button>
<div>Hello</div>
<div data-variant="red">Click Me!</div>
<div>World</div>
<div data-variant="green">Click Me!</div>`,
        container.innerHTML,
    );
});

test.serial("render MDX with import statement", async (t) => {
    const { container } = render(
        <MDX code={mdxWithImportStatement} resolveImport={resolveImport} />,
    );
    await wait(16);
    t.is(
        `<button data-variant="blue">Click Me!</button>
<div>Hello</div>
<div data-variant="red">Click Me!</div>
<div>World</div>
<div data-variant="green">Click Me!</div>`,
        container.innerHTML,
    );
});

test.serial(
    "the Provider receives all imports and exports in its scope",
    async (t) => {
        const Context = React.createContext<any>({});

        const calls: any[] = [];
        const Provider = (({ children, ...args }) => {
            calls.push(args);
            return <Context.Provider {...args}>{children}</Context.Provider>;
        }) as typeof Context.Provider;

        render(
            <MDX
                code={mdxWithImportStatement}
                resolveImport={resolveImport}
                Provider={Provider}
            />,
        );
        await wait(5);
        t.is(1, calls.length);

        t.is(true, calls[0].value.isReady);

        t.deepEqual(
            [
                // Provided via import
                "Button",
                // Defined as exports
                "InlineElement",
                "AlternateButton",
                "AlternateInlineButton",
                "props",
                "label",
            ].sort(),
            Object.keys(calls[0].value.scope).sort(),
        );

        // Check some of the variables
        t.is("Click Me!", calls[0].value.scope.label);
        t.is(Button, calls[0].value.scope.Button);
    },
);

test.serial(
    "it properly merges defaultScope and detected imports in the Provider scope",
    async (t) => {
        const Context = React.createContext<any>({});

        const calls: any[] = [];
        const Provider = (({ children, ...args }) => {
            calls.push(args);
            return <Context.Provider {...args}>{children}</Context.Provider>;
        }) as typeof Context.Provider;

        const resolveImport = async () => {
            return "detected";
        };
        render(
            <MDX
                code={`
import A from 'a';
`}
                defaultScope={{ b: "b", A: "A" }}
                resolveImport={resolveImport}
                Provider={Provider}
            />,
        );
        await wait(16);
        t.deepEqual(
            {
                A: "detected", // A is "detected" and not "A" like in the defaultScope
                b: "b",
            } as Record<string, any>,
            calls[0].value.scope,
        );
    },
);

test.serial("kitchen sink", async (t) => {
    const Context = React.createContext<any>({});

    const calls: any[] = [];
    const Provider = (({ children, ...args }) => {
        calls.push(args);
        return <Context.Provider {...args}>{children}</Context.Provider>;
    }) as typeof Context.Provider;

    render(
        <MDX
            Provider={Provider}
            defaultScope={{ variant: "blue", Button: () => null }}
            code={`
import { Button } from '@blocz/element';

export const label = "Click Me!";

<Button variant={variant} label={label} />
`}
            resolveImport={resolveImport}
        />,
    );
    await wait(16);
    t.deepEqual(
        {
            Button: Button,
            label: "Click Me!",
            variant: "blue",
        } as Record<string, any>,
        calls[0].value.scope,
    );
});
