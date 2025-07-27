#!/usr/bin/env node

const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const [_, __, ...argv] = process.argv;

const versionIndex = argv.findIndex(
    (arg) => arg === "-v" || arg === "--version",
);
if (versionIndex === argv.length - 1 || versionIndex === -1) {
    return;
}

const version = argv[versionIndex + 1];
argv.splice(versionIndex, 2);

updateAllVersions(version);
deploy("@blocz/mdx-plugin-detect-imports");
deploy("@blocz/mdx-live");
commit(version);
addTag(version);
push();

function* listAllWorkspaces() {
    const { status, stdout: output } = cp.spawnSync(
        "pnpm",
        ["list", "-r", "--depth", "-1", "--json"],
        {
            encoding: "utf-8",
        },
    );
    if (status !== 0) {
        process.exit(status);
    }
    const workspaces = JSON.parse(output);

    for (const workspace of workspaces) {
        const packageJsonPath = path.join(
            __dirname,
            "..",
            workspace.location,
            "package.json",
        );
        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, { encoding: "utf-8" }),
        );

        yield { packageJsonPath, packageJson, name: workspace.name };
    }
}

function updateAllVersions(version) {
    for (const { packageJson, packageJsonPath } of listAllWorkspaces()) {
        packageJson.version = version;
        fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(packageJson, null, 4) + "\n",
        );
    }
}

function deploy(package) {
    const { status } = cp.spawnSync(
        "yarn",
        ["workspace", package, "npm", "publish", ...argv],
        {
            stdio: "inherit",
        },
    );
    if (status !== 0) {
        process.exit(status);
    }
}

function addTag(version) {
    const { status } = cp.spawnSync("git", ["tag", `v${version}`], {
        stdio: "inherit",
    });
    if (status !== 0) {
        process.exit(status);
    }
}

function commit(version) {
    const { status } = cp.spawnSync("git", ["add", "."], {
        stdio: "inherit",
    });
    if (status !== 0) {
        process.exit(status);
    }
    const { status: status2 } = cp.spawnSync(
        "git",
        ["commit", "-m", `v${version}`],
        {
            stdio: "inherit",
        },
    );
    if (status2 !== 0) {
        process.exit(status2);
    }
}

function push() {
    const { status } = cp.spawnSync("git", ["push"], {
        stdio: "inherit",
    });
    if (status !== 0) {
        process.exit(status);
    }
    const { status: status2 } = cp.spawnSync("git", ["push", "--tags"], {
        stdio: "inherit",
    });
    if (status2 !== 0) {
        process.exit(status2);
    }
}
