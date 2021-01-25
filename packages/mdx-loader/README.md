Deprecated, use [@mdx-js/loader](https://www.npmjs.com/package/@mdx-js/loader) + the plugin [`@blocz/mdx-plugin-detect-imports`](https://www.npmjs.com/package/@blocz/mdx-plugin-detect-imports)

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
