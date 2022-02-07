import { selectAll } from "unist-util-select";

const exportLength = "export ".length;
const exportConstLength = "export const ".length;

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
                    continue;
                case "ImportDefaultSpecifier":
                    imports.push(`{
                        kind: "default",
                        local: "${specifier.local.name}",
                        value: ${specifier.local.name}
                    }`);
                    continue;
                case "ImportSpecifier":
                    imports.push(`{
                        kind: "named",
                        local: "${specifier.local.name}",
                        value: ${specifier.imported.name}
                    }`);
                    continue;
                default:
                    continue;
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
    const variablePlacement = exportConstLength + variableName.length;
    const equalPlacement = variablePlacement + 3;
    const length = rawCode.length;
    const offsetEnd = offset + length;
    return {
        type: "mdxjsEsm",
        value: rawCode,
        position: {
            start: {
                line,
                column: 1,
                offset: offset,
            },
            end: {
                line,
                column: 1 + length,
                offset: offsetEnd,
            },
        },
        data: {
            estree: {
                type: "Program",
                start: offset,
                end: offsetEnd,
                body: [
                    {
                        type: "ExportNamedDeclaration",
                        start: offset,
                        end: offsetEnd,
                        declaration: {
                            type: "VariableDeclaration",
                            start: offset + exportLength,
                            end: offsetEnd,
                            declarations: [
                                {
                                    type: "VariableDeclarator",
                                    start: offset + exportConstLength,
                                    end: offsetEnd - 1,
                                    id: {
                                        type: "Identifier",
                                        start: offset + exportConstLength,
                                        end:
                                            offset +
                                            exportConstLength +
                                            variableName.length,
                                        name: variableName,
                                        loc: {
                                            start: {
                                                line,
                                                column: exportConstLength,
                                            },
                                            end: {
                                                line,
                                                column:
                                                    exportConstLength +
                                                    variableName.length,
                                            },
                                        },
                                        range: [
                                            offset + exportConstLength,
                                            offset + variablePlacement,
                                        ],
                                    },
                                    init: {
                                        type: "Literal",
                                        start: offset + equalPlacement,
                                        end: offsetEnd - 1,
                                        // TODO: use proper `ArrayExpression` and `ObjectExpression` nodes instead of abusing the `Literal` one
                                        value,
                                        raw: value,
                                        loc: {
                                            start: {
                                                line,
                                                column: equalPlacement,
                                            },
                                            end: {
                                                line,
                                                column: length - 1,
                                            },
                                        },
                                        range: [
                                            offset + equalPlacement,
                                            offsetEnd - 1,
                                        ],
                                    },
                                    loc: {
                                        start: {
                                            line,
                                            column: exportConstLength,
                                        },
                                        end: {
                                            line,
                                            column: length - 1,
                                        },
                                    },
                                    range: [
                                        offset + exportConstLength,
                                        offsetEnd - 1,
                                    ],
                                },
                            ],
                            kind: "const",
                            loc: {
                                start: {
                                    line,
                                    column: exportLength,
                                },
                                end: {
                                    line,
                                    column: length,
                                },
                            },
                            range: [offset + exportLength, offsetEnd],
                        },
                        specifiers: [],
                        source: null,
                        loc: {
                            start: {
                                line,
                                column: 0,
                            },
                            end: {
                                line,
                                column: length,
                            },
                        },
                        range: [offset, offsetEnd],
                    },
                ],
                sourceType: "module",
                comments: [],
                loc: {
                    start: {
                        line,
                        column: 0,
                    },
                    end: {
                        line,
                        column: length,
                    },
                },
                range: [offset, offsetEnd],
            },
        },
    };
};

export default ({ exportName = "importStatements" } = {}) =>
    (tree, file) => {
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
