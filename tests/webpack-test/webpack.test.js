const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const test = require("node:test");
const assert = require("node:assert/strict");
const webpack = require("webpack");
const detectImportsPlugin = require("@blocz/mdx-plugin-detect-imports");

const makeTemporary = async () => {
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), "blocz-mdx-"));
    const clear = async () => {
        await fs.rm(folderPath, { recursive: true });
    };
    return {
        folderPath,
        clear,
    };
};

test("it works with webpack", async () => {
    const tmpFolder = await makeTemporary();
    try {
        const compiler = webpack({
            entry: "./src/entry.mdx",
            output: {
                filename: "out.js",
                path: tmpFolder.folderPath,
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

        await new Promise((res, rej) => {
            compiler.run(async (err, stats) => {
                if (err) {
                    rej(err);
                    return;
                }
                if (stats.hasErrors()) {
                    const info = stats.toJson();
                    rej(info.errors);
                    return;
                }

                const content = await fs.readFile(
                    path.join(tmpFolder.folderPath, "out.js"),
                    "utf-8",
                );
                compiler.close((closeErr) => {
                    if (closeErr) {
                        rej(closeErr);
                        return;
                    }
                    assert.ok(content.includes('.h2,{children:"Hello MDX"})'));
                    assert.ok(content.includes('.li,{children:"First item"})'));
                    assert.ok(content.includes('.li,{children:"Second item"})'));
                    assert.ok(
                        content.includes(
                            '.Button,{variant:"blue",label:"Label"})',
                        ),
                    );
                    assert.ok(content.includes("importStatements"));
                    assert.ok(
                        content.includes(
                            '[{module:"./elements",imports:[{kind:"named",imported:"Tabs",local:"Tabs",value:t.Tabs},{kind:"named",imported:"Button",local:"ButtonElement",value:t.Button}]}]',
                        ),
                    );
                    res();
                });
            });
        });
    } finally {
        await tmpFolder.clear();
    }
});

test("it works with webpack and a custom name", async () => {
    const tmpFolder = await makeTemporary();
    try {
        const compiler = webpack({
            entry: "./src/entry.mdx",
            output: {
                filename: "out.js",
                path: tmpFolder.folderPath,
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

        await new Promise((res, rej) => {
            compiler.run(async (err, stats) => {
                if (err) {
                    rej(err);
                    return;
                }
                if (stats.hasErrors()) {
                    const info = stats.toJson();
                    rej(info.errors);
                    return;
                }

                const content = await fs.readFile(
                    path.join(tmpFolder.folderPath, "out.js"),
                    "utf-8",
                );
                compiler.close((closeErr) => {
                    if (closeErr) {
                        rej(closeErr);
                        return;
                    }
                    assert.ok(content.includes('.h2,{children:"Hello MDX"})'));
                    assert.ok(content.includes('.li,{children:"First item"})'));
                    assert.ok(content.includes('.li,{children:"Second item"})'));
                    assert.ok(
                        content.includes(
                            '.Button,{variant:"blue",label:"Label"})',
                        ),
                    );
                    assert.ok(content.includes("otherName"));
                    assert.ok(
                        content.includes(
                            '[{module:"./elements",imports:[{kind:"named",imported:"Tabs",local:"Tabs",value:t.Tabs},{kind:"named",imported:"Button",local:"ButtonElement",value:t.Button}]}]',
                        ),
                    );
                    res();
                });
            });
        });
    } finally {
        await tmpFolder.clear();
    }
});

test("it works with webpack and require.resolve", async () => {
    const tmpFolder = await makeTemporary();
    try {
        const compiler = webpack({
            entry: "./src/entry.mdx",
            output: {
                filename: "out.js",
                path: tmpFolder.folderPath,
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

        await new Promise((res, rej) => {
            compiler.run(async (err, stats) => {
                if (err) {
                    rej(err);
                    return;
                }
                if (stats.hasErrors()) {
                    const info = stats.toJson();
                    rej(info.errors);
                    return;
                }

                const content = await fs.readFile(
                    path.join(tmpFolder.folderPath, "out.js"),
                    "utf-8",
                );
                compiler.close((closeErr) => {
                    if (closeErr) {
                        rej(closeErr);
                        return;
                    }
                    assert.ok(content.includes('.h2,{children:"Hello MDX"})'));
                    assert.ok(content.includes('.li,{children:"First item"})'));
                    assert.ok(content.includes('.li,{children:"Second item"})'));
                    assert.ok(
                        content.includes(
                            '.Button,{variant:"blue",label:"Label"})',
                        ),
                    );
                    assert.ok(content.includes("importStatements"));
                    assert.ok(
                        content.includes(
                            '[{module:"./elements",imports:[{kind:"named",imported:"Tabs",local:"Tabs",value:t.Tabs},{kind:"named",imported:"Button",local:"ButtonElement",value:t.Button}]}]',
                        ),
                    );
                    res();
                });
            });
        });
    } finally {
        await tmpFolder.clear();
    }
});
