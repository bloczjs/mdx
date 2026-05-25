import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import esbuild from "esbuild";

import mdx from "@mdx-js/esbuild";
import detectImportsPlugin from "@blocz/mdx-plugin-detect-imports";

test("it works with esbuild", async () => {
    await esbuild.build({
        entryPoints: ["src/entry.mdx"],
        outfile: "dist/output.js",
        minifyWhitespace: true,
        format: "esm",
        plugins: [
            mdx({
                remarkPlugins: [detectImportsPlugin],
            }),
        ],
    });

    const content = fs.readFileSync("dist/output.js", "utf-8");
    fs.unlinkSync("dist/output.js");

    assert.ok(content.includes('.h2,{children:"Hello MDX"})'));
    assert.ok(content.includes('.li,{children:"First item"})'));
    assert.ok(content.includes('.li,{children:"Second item"})'));
    assert.ok(content.includes('ButtonElement,{variant:"blue",label:"Label"})'));
    assert.ok(
        content.includes(
            `const importStatements=[{module:"./elements",imports:[{kind:"named",imported:"Tabs",local:"Tabs",value:Tabs},{kind:"named",imported:"Button",local:"ButtonElement",value:ButtonElement}]}];`,
        ),
    );
});

test("it works with esbuild and a custom name", async () => {
    await esbuild.build({
        entryPoints: ["src/entry.mdx"],
        outfile: "dist/output-1.js",
        minifyWhitespace: true,
        format: "esm",
        plugins: [
            mdx({
                remarkPlugins: [
                    [detectImportsPlugin, { exportName: "otherName" }],
                ],
            }),
        ],
    });

    const content = fs.readFileSync("dist/output-1.js", "utf-8");
    fs.unlinkSync("dist/output-1.js");

    assert.ok(content.includes('.h2,{children:"Hello MDX"})'));
    assert.ok(content.includes('.li,{children:"First item"})'));
    assert.ok(content.includes('.li,{children:"Second item"})'));
    assert.ok(content.includes('ButtonElement,{variant:"blue",label:"Label"})'));
    assert.ok(
        content.includes(
            `const otherName=[{module:"./elements",imports:[{kind:"named",imported:"Tabs",local:"Tabs",value:Tabs},{kind:"named",imported:"Button",local:"ButtonElement",value:ButtonElement}]}];`,
        ),
    );
});
