#!/usr/bin/env node

const cp = require("child_process");

test("@blocz/mdx-plugin-detect-imports");
test("@blocz/mdx-live");
test("@blocz/webpack-test");
test("@blocz/esbuild-test");
test("@blocz/rollup-test");

function test(package) {
    cp.spawnSync("yarn", ["workspace", package, "test"], {
        stdio: "inherit",
    });
}
