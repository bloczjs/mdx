import test from "node:test";
import assert from "node:assert/strict";

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

test("it works with rollup", async () => {
    const content = await buildEntry({
        remarkPlugins: [detectImportsPlugin],
    });

    assert.ok(content.match(/\.h2, {\s*children: "Hello MDX"/));
    assert.ok(content.match(/\.li, {\s*children: "First item"/));
    assert.ok(content.match(/\.li, {\s*children: "Second item"/));
    assert.ok(content.match(/Button, {\s*variant: "blue",\s*label: "Label"/));
    assert.ok(
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

test("it works with rollup and a custom name", async () => {
    const content = await buildEntry({
        remarkPlugins: [[detectImportsPlugin, { exportName: "otherName" }]],
    });

    assert.ok(content.match(/\.h2, {\s*children: "Hello MDX"/));
    assert.ok(content.match(/\.li, {\s*children: "First item"/));
    assert.ok(content.match(/\.li, {\s*children: "Second item"/));
    assert.ok(content.match(/Button, {\s*variant: "blue",\s*label: "Label"/));
    assert.ok(
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
