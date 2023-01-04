import test from "ava";

import { rollup } from "rollup";
import mdx from "@mdx-js/rollup";

import detectImportsPlugin from "@blocz/mdx-plugin-detect-imports";

const buildEntry = async (mdxOptions) => {
    const inputOptions = {
        input: "src/entry.mdx",
        plugins: [mdx(mdxOptions)],
    };

    const outputOptions = {
        file: "out.js",
    };

    let bundle;
    try {
        bundle = await rollup(inputOptions);
        const { output } = await bundle.generate(outputOptions);
        return output[0].code;
    } catch (error) {
        throw error;
    } finally {
        if (bundle) {
            await bundle.close();
        }
    }
};

test("it works with rollup", async (t) => {
    const content = await buildEntry({
        remarkPlugins: [detectImportsPlugin],
    });

    t.truthy(content.match(/\.h2, {\s*children: "Hello MDX"/));
    t.truthy(content.match(/\.li, {\s*children: "First item"/));
    t.truthy(content.match(/\.li, {\s*children: "Second item"/));
    t.truthy(content.match(/Button, {\s*variant: "blue",\s*label: "Label"/));
    t.truthy(
        content.includes(
            `const importStatements = [{
  module: "./elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: Button
  }]
}];`,
        ),
    );
});

test("it works with rollup and a custom name", async (t) => {
    const content = await buildEntry({
        remarkPlugins: [[detectImportsPlugin, { exportName: "otherName" }]],
    });

    t.truthy(content.match(/\.h2, {\s*children: "Hello MDX"/));
    t.truthy(content.match(/\.li, {\s*children: "First item"/));
    t.truthy(content.match(/\.li, {\s*children: "Second item"/));
    t.truthy(content.match(/Button, {\s*variant: "blue",\s*label: "Label"/));
    t.truthy(
        content.includes(
            `const otherName = [{
  module: "./elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: Button
  }]
}];`,
        ),
    );
});
