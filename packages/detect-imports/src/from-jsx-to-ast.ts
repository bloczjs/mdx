import jsx from "acorn-jsx";
import { Parser, Node } from "acorn";

interface GeneratedAST extends Node {
    body: Node[];
}

export const fromJSXToAst = async (code: string) =>
    Parser.extend(jsx()).parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
    }) as GeneratedAST;
