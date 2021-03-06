const { detectImports } = require("@blocz/detect-imports");
const { selectAll } = require("unist-util-select");

module.exports = ({ exportName = "importStatements" } = {}) => async (
    tree,
    file,
) => {
    const imports = selectAll("import", tree);
    const importStatementString = imports.map((i) => i.value).join("\n");

    const importStatements = await detectImports(importStatementString);
    // cannot use JSON.stringify because there are no quotes around `value: <importStatement.local>`
    const exportedArray = importStatements
        .map(
            (declaration) => `{
    module: "${declaration.module}",
    imports: [
        ${declaration.imports
            .map(
                (importStatement) => `{
            imported: "${importStatement.imported}",
            local: "${importStatement.local}",
            value: ${importStatement.local}
        }`,
            )
            .join(", ")}
    ]
}`,
        )
        .join(", ")
        .replace(/\s+/g, " ");

    const exportTextWithImportStatements = `export const ${exportName} = [${exportedArray}];`;

    const { line, position } = tree.position.end;

    // inject export statement
    tree.children.push({
        type: "export",
        value: exportTextWithImportStatements,
        position: {
            start: {
                line: line + 1,
                column: 1,
                position: position + 1,
            },
            end: {
                line: line + 1,
                column: 1 + exportTextWithImportStatements.length,
                position: position + 1 + exportTextWithImportStatements.length,
            },
        },
    });

    // modify end position to include the new export statement
    tree.position.end.line = line + 2;
    tree.position.end.position =
        position + 2 + exportTextWithImportStatements.length;
};
