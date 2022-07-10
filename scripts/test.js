#!/usr/bin/env node

const cp = require("child_process");

test("@blocz/mdx-plugin-detect-imports");
test("@blocz/mdx-live");

function test(package) {
    cp.spawnSync("yarn", ["workspace", package, "test"], {
        stdio: "inherit",
    });
}
