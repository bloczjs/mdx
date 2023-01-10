# `@blocz/mdx-live` <!-- omit in toc -->

`@blocz/mdx-live` allows you to dynamically render a MDX string.

It understands the import statements, and you can provide how they will get resolved.

Exports statements are also executed. **WARNING:** this allows XSS so be sure to be in a safe environment.

You can also provide a scope for all the variables and components used in the MDX.

-   [MDX 2](#mdx-2)
-   [ESM](#esm)
-   [How to use](#how-to-use)
    -   [Simple MDX](#simple-mdx)
    -   [With scope](#with-scope)
    -   [With export statement](#with-export-statement)
    -   [With import statement](#with-import-statement)
    -   [Plugins](#plugins)
    -   [Provider](#provider)
    -   [`useMDX` hook](#usemdx-hook)

## MDX 2

Since the v0.2.0, it's based on MDX v2. It you want to use it with MDX v1, you can look at the [v0.1.0](https://github.com/bloczjs/mdx/tree/v0.1.0).<br/>
If you’re looking to upgrade to the v0.2.0, [the list of breaking changes is listed here](https://github.com/bloczjs/mdx/releases/tag/v0.2.0).

This package requires you to also install `@mdx-js/mdx`:

```bash
yarn add @mdx-js/mdx @blocz/mdx-live
```

## ESM

> **Warning**<br/>
> This package is only published as an ESM package, it doesn't provide any CJS exports.<br/>
> MDX also switched to ESM only in their v2 (see https://mdxjs.com/migrating/v2/#esm).

## How to use

### Simple MDX

```jsx
import { MDX } from "@blocz/mdx-live";

const simpleMDX = `
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
`;

const App = () => {
    return <MDX code={simpleMDX} />;
};
```

### With scope

```jsx
import { MDX } from "@blocz/mdx-live";

const Button = ({ label, variant, onClick }) => (
    <button data-variant={variant} onClick={onClick}>
        {label}
    </button>
);

const scopedMDX = `
<Button
    variant="blue"
    label="Click Me!"
    onClick={() => alert('Hello there!')}
/>
`;

const App = () => {
    return <MDX code={scopedMDX} defaultScope={{ Button }} />;
};
```

### With export statement

```jsx
import { MDX } from "@blocz/mdx-live";

const Button = ({ label, variant, onClick }) => (
    <button data-variant={variant} onClick={onClick}>
        {label}
    </button>
);

const exportMDX = `
export const label = "Click Me!";

<Button variant="blue" label={label} />
`;

const App = () => {
    return <MDX code={exportMDX} defaultScope={{ Button }} />;
};
```

### With import statement

```jsx
import { MDX } from "@blocz/mdx-live";

const Button = ({ label, variant, onClick }) => (
    <button data-variant={variant} onClick={onClick}>
        {label}
    </button>
);

const importMDX = `
import { Button } from 'example';

<Button variant="blue" label="Click Me!" />
`;

const resolveImport = async (option) => {
    if (
        option.kind === "named" &&
        option.path === "example" &&
        option.variable === "Button"
    ) {
        return Button;
    }

    return undefined;
};

const App = () => {
    return <MDX code={importMDX} resolveImport={resolveImport} />;
};
```

```ts
export type ResolveImport = (
    option:
        | { kind: "named"; path: string; variable: string }
        | { kind: "namespace" | "default"; path: string },
) => Promise<any>;
```

### Plugins

You can use the props `recmaPlugins`, `rehypePlugins`, and `remarkPlugins` to pass [remark](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins) (plugins based on the markdown AST), [rehype](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins) (plugins based on the html AST), and recma (plugins based on the JS AST) plugins to the MDX compiler.

See https://mdxjs.com/packages/mdx/#optionsremarkplugins for more information.

### Provider

If you need to have access to more information in a custom renderer (like for instance a custom code block renderer), you can provide a `Provider` to `MDX`.

`Provider` will be provided an object with:

-   `text` and `isReady`, like [`useMDX`](#usemdx-hook)’s returned value,
-   a `scope` object, which is a merge between:
    -   the `defaultScope` prop,
    -   resolved imports thanks to `resolveImport`,
    -   exported values in the MDX.

For instance, with the following example:

```jsx
<MDX
    Provider={Provider}
    defaultScope={{ variant: "blue" }}
    code={`
import { Button } from 'example';

export const label = "Click Me!";

<Button variant={variant} label={label} />
`}
    resolveImport={async () => ButtonVariable}
/>
```

The `Provider` will be called with a `scope` of:

```js
{
    Button: ButtonVariable,
    label: "Click Me!",
    variant: "blue",
}
```

### `useMDX` hook

Except for `Provider`, all of the other props available on `MDX` are also available as a param on the `useMDX` hook:

```jsx
import { useMDX } from "@blocz/mdx-live";

const Button = ({ label, variant, onClick }) => (
    <button data-variant={variant} onClick={onClick}>
        {label}
    </button>
);

const importMDX = `
import { Button } from 'example';

<Button variant="blue" label="Click Me!" />
`;

const resolveImport = async (option) => {
    if (
        option.kind === "named" &&
        option.path === "example" &&
        option.variable === "Button"
    ) {
        return Button;
    }

    return undefined;
};

const App = () => {
    const { resolvedImports, text, isReady } = useMDX({
        code: importMDX,
        resolveImport,
    });

    // resolvedImports = Object containing all the resolved imports (in this case there is only `Button`)
    // text = parsed version of the MDX code without MDX nor JSX, aka plain code that can be executed
    // isReady: boolean representing if the code sample has been fully parsed yet or if it's still getting parsed
};
```
