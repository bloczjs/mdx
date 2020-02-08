# TL;DR

The only difference between [`@mdx-js/loader`](https://www.npmjs.com/package/@mdx-js/loader) and `@blocz/mdx-loader` is that `@blocz/mdx-loader` outputs, in addition to the MDX component, an object `importStatements` with the list of every imports defined in the MDX file.

## How to use

`yarn add -D @blocz/mdx-loader`

And then, adds in your webpack config:

```js
module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /.mdx?$/,
                loader: "@blocz/mdx-loader",
            },
        ],
    },
};
```

And finally:

`import MyAwesomeComponent, { importStatements } from './my-awesome-component.mdx';`

## type `importStatements`

```typescript
interface ImportStatement {
    module: string;
    imports: Array<{
        imported: string;
        local: string;
        value: any;
    }>;
}

// example with
// import React, { Component } from 'react';
// import { MDX as MDXLive } from '@blocz/mdx-live';

const importStatements: ImportStatement[] = [
    {
        module: "react",
        imports: [
            {
                imported: "default",
                local: "React",
                value: this_is_the_value_of_the_variable_React,
            },
            {
                imported: "Component",
                local: "Component",
                value: this_is_the_value_of_the_variable_Component,
            },
        ],
    },
    {
        module: "@blocz/mdx-live",
        imports: [
            {
                imported: "MDX",
                local: "MDXLive",
                value: this_is_the_value_of_the_variable_MDXLive,
            },
        ],
    },
];
```
