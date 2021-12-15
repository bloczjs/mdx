#!/usr/bin/env node

const cp = require("child_process");
const path = require("path");

build("@blocz/detect-imports");
build("@blocz/mdx-live");

function build(package) {
    cp.spawnSync("yarn", ["workspace", package, "build"], {
        stdio: "inherit",
    });
}
