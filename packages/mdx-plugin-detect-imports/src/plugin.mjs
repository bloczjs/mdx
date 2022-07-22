import { parse } from "acorn";
import { selectAll } from "unist-util-select";
import { visit } from "estree-util-visit";

const generateImportStatements = (tree) => {
    const importDeclarations = selectAll("mdxjsEsm", tree)
        .flatMap((res) => res.data.estree.body)
        .flatMap((res) => selectAll("ImportDeclaration", res));

    const importStatements = [];
    /**
     * Note: we cannot use JSON.stringify because there are no quotes around `value: <value>`
     * So we need to manually build the strings that will be injected in the MDX.
     * That's why we use strings in `imports.push(...)` and why we manually do the `.join`s.
     */
    for (const importDeclaration of importDeclarations) {
        const imports = [];
        for (const specifier of importDeclaration.specifiers) {
            switch (specifier.type) {
                case "ImportNamespaceSpecifier":
                    imports.push(`{
                        kind: "namespace",
                        local: "${specifier.local.name}",
                        value: ${specifier.local.name}
                    }`);
                    break;
                case "ImportDefaultSpecifier":
                    imports.push(`{
                        kind: "default",
                        local: "${specifier.local.name}",
                        value: ${specifier.local.name}
                    }`);
                    break;
                case "ImportSpecifier":
                    imports.push(`{
                        kind: "named",
                        local: "${specifier.local.name}",
                        value: ${specifier.imported.name}
                    }`);
                    break;
                default:
                    break;
            }
        }
        //
        const importStatement = `{
            module: "${importDeclaration.source.value}",
            imports: [${imports.join(", ")}]
        }`;
        importStatements.push(importStatement);
    }

    return `[${importStatements.join(", ").replace(/\s+/g, " ")}]`;
};

const getExportStatement = ({ line, offset, variableName, value }) => {
    const rawCode = `export const ${variableName} = ${value};`;
    const ast = parse(rawCode, {
        sourceType: "module",
        ecmaVersion: "latest",
        locations: false,
    });

    const length = ast.end - ast.start;

    visit(ast, (node) => {
        node.start += offset;
        node.end += offset;
    });

    return {
        type: "mdxjsEsm",
        value: rawCode,
        position: {
            start: {
                line,
                offset: offset,
            },
            end: {
                line,
                offset: offset + length,
            },
        },
        data: {
            estree: ast,
        },
    };
};

export default ({ exportName = "importStatements" } = {}) =>
    async (tree, file) => {
        const importStatements = generateImportStatements(tree);
        const injectedNode = getExportStatement({
            line: tree.position.end.line + 1,
            offset: tree.position.end.offset,
            variableName: exportName,
            value: importStatements,
        });
        tree.children.push(injectedNode);
        tree.position.end.line = injectedNode.position.end.line;
        tree.position.end.position = injectedNode.position.end.position;
    };
