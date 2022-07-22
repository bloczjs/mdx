module.exports =
    ({ exportName = "importStatements" } = {}) =>
    async (tree, file) => {
        const getPlugin = await import("./plugin.mjs");
        const configuredPlugin = getPlugin.default({ exportName });
        await configuredPlugin(tree, file);
    };
