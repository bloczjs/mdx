import { sync } from "@mdx-js/mdx";
import { transform } from "buble-jsx-only";

export const compileMDX = ({
    scope,
    code,
    remarkPlugins = [],
    rehypePlugins = [],
}: {
    scope: Record<string, any>;
    code: string;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
}) => {
    const injectedImports = `import { ${Object.keys(scope)} } from '.';\n\n`;
    const compiledCode = sync(injectedImports + code, {
        remarkPlugins: remarkPlugins,
        rehypePlugins: rehypePlugins,
        skipExport: true,
    }).trim();

    let transformedCode;

    try {
        transformedCode = transform(compiledCode, {
            objectAssign: "Object.assign",
        }).code;
        transformedCode = transformedCode.replace(
            /import \{.*?\} from '.';/,
            "",
        );
    } catch (err) {
        console.error(err);
        throw err;
    }

    return transformedCode;
};
