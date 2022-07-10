#!/usr/bin/env node

const cp = require("child_process");

build("@blocz/mdx-live");

function build(package) {
    cp.spawnSync("yarn", ["workspace", package, "build"], {
        stdio: "inherit",
    });
}
