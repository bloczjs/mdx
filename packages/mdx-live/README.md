# `@blocz/mdx-live`

`@blocz/mdx-live` allows you to dynamically render a MDX string.

It understands the import statements, and you can provide how they will get resolved.

Exports statements are also executed. **WARNING:** this allows XSS so be sure to be in a safe environment.

You can also provide a scope for all the variables and components used in the MDX.

## MDX 2

Since the v0.2.0, it's based on MDX v2. It you want to use it with MDX v1, you can look at the [v0.1.0](https://github.com/bloczjs/mdx/tree/v0.1.0).

This package requires you to also install `@mdx-js/mdx`:

```bash
yarn add @mdx-js/mdx @blocz/mdx-live
```

## ESM

⚠️ This package is only published as an ESM package, it doesn't provide any CJS exports.
The reason behind this is because MDX switch to ESM only in their v2 too (see https://mdxjs.com/migrating/v2/#esm).\
And as you'll also need regular MDX packages to make this one work, we also switched to ESM.

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
