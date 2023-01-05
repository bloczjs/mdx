# `@blocz/mdx-plugin-detect-imports`

MDX plugin to detect the list of every imports done in a MDX file.

## MDX 2

Since the v0.2.0, it's based on MDX v2. It you want to use it with MDX v1, you can look at the [v0.1.0](https://github.com/bloczjs/mdx/tree/v0.1.0).<br/>
If you’re looking to upgrade to the v0.2.0, [the list of breaking changes is listed here](https://github.com/bloczjs/mdx/releases/tag/v0.2.0).

## What does it do?

If your MDX file look like this:

```mdx
import { Tabs, Button } from "@blocz/elements";

## Hello MDX

1. First item
2. Second item

<Button variant="blue" label="Label" />
```

This plugin will transform this file into:

```mdx
import { Button, Tabs as Tabulations } from "@blocz/elements";

## Hello MDX

1. First item
2. Second item

<Button variant="blue" label="Label" />

export const importStatements = [
    {
        module: "@blocz/elements",
        imports: [
            {
                kind: "named",
                imported: "Button",
                local: "Button",
                value: this_is_the_value_of_the_variable_Button
            },
            {
                kind: "named",
                imported: "Tabs",
                local: "Tabulations",
                value: this_is_the_value_of_the_variable_Tabs
            }
        ]
    }

]
```

## How to use

`yarn add -D @blocz/mdx-plugin-detect-imports`

### Webpack

```js
const detectImportsPlugin = require("@blocz/mdx-plugin-detect-imports");

module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /.mdx?$/,
                loader: "@mdx-js/loader",
                options: {
                    remarkPlugins: [detectImportsPlugin],
                    // Or if you want to specify a custom name for the exported variable:
                    remarkPlugins: [
                        [detectImportsPlugin, { exportName: "otherName" }],
                    ],
                },
            },
        ],
    },
};
```

And finally:

`import MyAwesomeComponent, { importStatements } from './my-awesome-component.mdx';`
(or `import MyAwesomeComponent, { otherName } from './my-awesome-component.mdx';` if you specified a custom name.)

### With MDX

```js
import compile from "@mdx-js/mdx";
import detectImportsPlugin from "@blocz/mdx-plugin-detect-imports";

const vFile = await compile(mdxText, {
    remarkPlugins: [detectImportsPlugin],
});

// Or if you want to specify a custom name for the exported variable:

const vFile = await compile(mdxText, {
    remarkPlugins: [[detectImportsPlugin, { exportName: "otherName" }]],
});
```

## type `ImportStatement`

If you need typings, we provide the following type:

```typescript
interface ImportStatement {
    module: string;
    imports: Array<
        | {
              kind: "named";
              imported: string;
              local: string;
              value: any;
          }
        | {
              kind: "namespace" | "default";
              local: string;
              value: any;
          }
    >;
}
```

And then you can do:

```typescript
// mdx.d.ts
declare module "*.mdx" {
    const MDXComponent: (props: any) => JSX.Element;
    // you can replace `importStatements` with your own variable name
    export const importStatements: ImportStatement[];
    export default MDXComponent;
}
```
