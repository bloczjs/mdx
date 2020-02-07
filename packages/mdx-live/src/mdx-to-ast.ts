import { createMdxAstCompiler } from "@mdx-js/mdx";

const OPTIONS = {
    footnotes: true,
    remarkPlugins: [],
    rehypePlugins: [],
    compilers: [],
};

export const transformMDXToAST = async (text: string) => {
    try {
        return createMdxAstCompiler(OPTIONS).parse(text);
    } catch (e) {
        return { children: [] };
    }
};
