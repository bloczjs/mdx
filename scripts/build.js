#!/usr/bin/env node

const cp = require("child_process");

build("@blocz/mdx-live");

function build(package) {
    const { status } = cp.spawnSync("pnpm", ["--filter", package, "build"], {
        stdio: "inherit",
    });
    if (status !== 0) {
        process.exit(status);
    }
}
