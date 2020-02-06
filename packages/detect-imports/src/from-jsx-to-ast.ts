import jsx from "acorn-jsx";
import { Parser } from "acorn";

export const fromJSXToAst = (code: string) =>
  Parser.extend(jsx()).parse(code, {
    sourceType: "module"
  }) as any;
