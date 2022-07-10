const test = require("ava");
const { createFsFromVolume, Volume } = require("memfs");
const webpack = require("webpack");
const detectImportsPlugin = require("@blocz/mdx-plugin-detect-imports");

test("it works with webpack", (t) => {
    const fs = createFsFromVolume(new Volume());

    const compiler = webpack({
        entry: "./src/entry.mdx",
        output: {
            filename: "out.js",
            path: "/",
        },
        target: "web",
        mode: "production",
        // Disable tree shaking
        optimization: {
            usedExports: false,
        },
        module: {
            rules: [
                {
                    test: /\.mdx?$/,
                    use: [
                        {
                            loader: "@mdx-js/loader",
                            options: {
                                remarkPlugins: [detectImportsPlugin],
                            },
                        },
                    ],
                },
            ],
        },
    });
    compiler.outputFileSystem = fs;

    return new Promise((res, rej) => {
        compiler.run((err) => {
            if (err) {
                rej(err);
                return;
            }
            const content = fs.readFileSync("/out.js", "utf-8");
            compiler.close((closeErr) => {
                if (closeErr) {
                    rej(closeErr);
                    return;
                }
                t.truthy(content.includes('.h2,{children:"Hello MDX"})'));
                t.truthy(content.includes('.li,{children:"First item"})'));
                t.truthy(content.includes('.li,{children:"Second item"})'));
                t.truthy(
                    content.includes('.Button,{variant:"blue",label:"Label"})'),
                );
                t.truthy(content.includes("importStatements"));
                t.truthy(
                    content.includes(
                        '[{module:"./elements",imports:[{kind:"named",local:"Tabs",value:t.Tabs},{kind:"named",local:"Button",value:t.Button}]}]',
                    ),
                );
                res();
            });
        });
    });
});

test("it works with webpack and a custom name", (t) => {
    const fs = createFsFromVolume(new Volume());

    const compiler = webpack({
        entry: "./src/entry.mdx",
        output: {
            filename: "out.js",
            path: "/",
        },
        target: "web",
        mode: "production",
        // Disable tree shaking
        optimization: {
            usedExports: false,
        },
        module: {
            rules: [
                {
                    test: /\.mdx?$/,
                    use: [
                        {
                            loader: "@mdx-js/loader",
                            options: {
                                remarkPlugins: [
                                    [
                                        detectImportsPlugin,
                                        { exportName: "otherName" },
                                    ],
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    });
    compiler.outputFileSystem = fs;

    return new Promise((res, rej) => {
        compiler.run((err) => {
            if (err) {
                rej(err);
                return;
            }
            const content = fs.readFileSync("/out.js", "utf-8");
            compiler.close((closeErr) => {
                if (closeErr) {
                    rej(closeErr);
                    return;
                }
                t.truthy(content.includes('.h2,{children:"Hello MDX"})'));
                t.truthy(content.includes('.li,{children:"First item"})'));
                t.truthy(content.includes('.li,{children:"Second item"})'));
                t.truthy(
                    content.includes('.Button,{variant:"blue",label:"Label"})'),
                );
                t.truthy(content.includes("otherName"));
                t.truthy(
                    content.includes(
                        '[{module:"./elements",imports:[{kind:"named",local:"Tabs",value:t.Tabs},{kind:"named",local:"Button",value:t.Button}]}]',
                    ),
                );
                res();
            });
        });
    });
});

test("it works with webpack and require.resolve", (t) => {
    const fs = createFsFromVolume(new Volume());

    const compiler = webpack({
        entry: "./src/entry.mdx",
        output: {
            filename: "out.js",
            path: "/",
        },
        target: "web",
        mode: "production",
        // Disable tree shaking
        optimization: {
            usedExports: false,
        },
        module: {
            rules: [
                {
                    test: /\.mdx?$/,
                    use: [
                        {
                            loader: require.resolve("@mdx-js/loader"),
                            options: {
                                remarkPlugins: [detectImportsPlugin],
                            },
                        },
                    ],
                },
            ],
        },
    });
    compiler.outputFileSystem = fs;

    return new Promise((res, rej) => {
        compiler.run((err) => {
            if (err) {
                rej(err);
                return;
            }
            const content = fs.readFileSync("/out.js", "utf-8");
            compiler.close((closeErr) => {
                if (closeErr) {
                    rej(closeErr);
                    return;
                }
                t.truthy(content.includes('.h2,{children:"Hello MDX"})'));
                t.truthy(content.includes('.li,{children:"First item"})'));
                t.truthy(content.includes('.li,{children:"Second item"})'));
                t.truthy(
                    content.includes('.Button,{variant:"blue",label:"Label"})'),
                );
                t.truthy(content.includes("importStatements"));
                t.truthy(
                    content.includes(
                        '[{module:"./elements",imports:[{kind:"named",local:"Tabs",value:t.Tabs},{kind:"named",local:"Button",value:t.Button}]}]',
                    ),
                );
                res();
            });
        });
    });
});
