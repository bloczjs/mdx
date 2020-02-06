import { fromJSXToAst } from "./from-jsx-to-ast";

const ImportDeclaration = "ImportDeclaration";
const ImportSpecifier = "ImportSpecifier";
const ImportDefaultSpecifier = "ImportDefaultSpecifier";

interface Import {
  imported: string;
  local: string;
}

export interface Declaration {
  module: string;
  imports: Import[];
}

export const detectImports = async (code: string) => {
  const ast = await fromJSXToAst(code);
  const importDeclarations = ast.body.filter(
    (declaration: any) => declaration.type === ImportDeclaration
  );
  return importDeclarations.map((declaration: any) => ({
    module: declaration.source.value,
    imports: declaration.specifiers
      .map((specifier: any) => {
        if (specifier.type === ImportDefaultSpecifier) {
          return {
            imported: "default",
            local: specifier.local.name
          };
        }
        if (specifier.type === ImportSpecifier) {
          return {
            imported: specifier.imported.name,
            local: specifier.local.name
          };
        }
        return null;
      })
      .filter(Boolean)
  })) as Declaration[];
};
