# `@blocz/mdx-live`

`@blocz/mdx-live` is a package that allows you to render a MDX string.

The difference with `@mdx-js/runtime` is that `@blocz/mdx-live` allows you to resolve import and export statements.

## Examples

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

<Button
    variant="blue"
    label={label}
    onClick={() => alert('Hello there!')}
/>
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

<Button
    variant="blue"
    label="Click Me!"
    onClick={() => alert('Hello there!')}
/>
`;

const resolveImport = async (module, variable) => {
    if (module === "example" && variable === "Button") {
        return Button;
    }
    return undefined;
};

const App = () => {
    return <MDX code={importMDX} resolveImport={resolveImport} />;
};
```
