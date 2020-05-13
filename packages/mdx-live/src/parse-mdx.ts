import { detectImports, ImportDeclaration } from "@blocz/detect-imports";

import { transformMDXToAST } from "./mdx-to-ast";
import { parseExportStatement } from "./parse-exports";

type Parse = (
    text: string,
) => Promise<{
    importDeclarations: ImportDeclaration[];
    constants: Constants;
    filteredText: string;
}>;

interface Constants {
    [name: string]: any;
}

export const parseMDX: Parse = async (inputText) => {
    const text = inputText
        // Add line breaks before each imports and exports to help the parsing
        .replace(/(\n|^)export /g, "\n\nexport ")
        .replace(/(\n|^)import /g, "\n\nimport ");

    const constants: Constants = {};
    let importDeclarations: ImportDeclaration[] = [];
    let filteredText = "";

    const AST = await transformMDXToAST(text);

    if (!AST.children || AST.children.length === 0) {
        return {
            constants,
            importDeclarations,
            filteredText,
        };
    }

    for (const child of AST.children) {
        // If is plain MD
        if (child.type !== "export" && child.type !== "import") {
            filteredText += `\n\n${text.substring(
                child.position.start.offset,
                child.position.end.offset,
            )}`;
            continue;
        }
        // If is an export
        if (child.type === "export") {
            const namedExport = parseExportStatement(child.value);
            if (!namedExport) {
                continue;
            }
            constants[namedExport.name] = namedExport.value;
            continue;
        }
        // If it is an import
        if (child.type === "import") {
            importDeclarations = [
                ...importDeclarations,
                ...(await detectImports(child.value)),
            ];
        }
    }
    return {
        constants,
        importDeclarations,
        filteredText,
    };
};
