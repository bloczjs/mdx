import test from "ava";
import fs from "node:fs";
import esbuild from "esbuild";

import mdx from "@mdx-js/esbuild";
import detectImportsPlugin from "@blocz/mdx-plugin-detect-imports";

test("it works with esbuild", async (t) => {
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

    t.truthy(content.includes('.h2,{children:"Hello MDX"})'));
    t.truthy(content.includes('.li,{children:"First item"})'));
    t.truthy(content.includes('.li,{children:"Second item"})'));
    t.truthy(content.includes('Button,{variant:"blue",label:"Label"})'));
    t.truthy(
        content.includes(
            `const importStatements=[{module:"./elements",imports:[{kind:"named",local:"Tabs",value:Tabs},{kind:"named",local:"Button",value:Button}]}];`,
        ),
    );
});

test("it works with esbuild and a custom name", async (t) => {
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

    t.truthy(content.includes('.h2,{children:"Hello MDX"})'));
    t.truthy(content.includes('.li,{children:"First item"})'));
    t.truthy(content.includes('.li,{children:"Second item"})'));
    t.truthy(content.includes('Button,{variant:"blue",label:"Label"})'));
    t.truthy(
        content.includes(
            `const otherName=[{module:"./elements",imports:[{kind:"named",local:"Tabs",value:Tabs},{kind:"named",local:"Button",value:Button}]}];`,
        ),
    );
});
