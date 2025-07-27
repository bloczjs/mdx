#!/usr/bin/env node

const cp = require("child_process");

build("@blocz/mdx-live");

function build(package) {
    cp.spawnSync("pnpm", ["--filter", package, "build"], {
        stdio: "inherit",
    });
}
