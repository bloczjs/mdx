import * as React from "react";

import { compile } from "@mdx-js/mdx";
import type { CompileOptions } from "@mdx-js/mdx";
import type { VFile } from "vfile";
import type { ImportDeclaration } from "estree";

import { selectAll } from "unist-util-select";

export interface Variables {
    [key: string]: any;
}

export interface UseMDXParams
    extends Pick<
        CompileOptions,
        "recmaPlugins" | "rehypePlugins" | "remarkPlugins"
    > {
    code: string;
    defaultScope?: Variables;
    resolveImport?: (
        option:
            | { kind: "named"; path: string; variable: string }
            | { kind: "namespace" | "default"; path: string },
    ) => Promise<any>;
}
export interface UseMDXOut {
    scope: Variables;
    text: string;
}

// const customError = new Error("fine");

const voidAsync = async () => {};

export const useMDX = ({
    code,
    defaultScope = {},
    resolveImport = voidAsync,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
}: UseMDXParams): UseMDXOut => {
    const [scope, setScope] = React.useState<Variables>({});

    const [vfile, setVFile] = React.useState<VFile | undefined>(undefined);
    const computingQueueRef = React.useRef<
        Parameters<typeof compileCode>[0] | null
    >(null);

    const isUnmountedRef = React.useRef(false);
    React.useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
        };
    }, []);

    const resolveImportRef = React.useRef(resolveImport);
    resolveImportRef.current = resolveImport;

    const callCompileCode = React.useCallback(() => {
        if (!computingQueueRef.current) {
            return;
        }
        const computingParams = computingQueueRef.current;
        computingQueueRef.current = null;
        const newScope: Variables = {};
        compileCode(computingParams, async (node) => {
            thisSpecifierMark: for (const specifier of node.specifiers) {
                let value;
                switch (specifier.type) {
                    case "ImportNamespaceSpecifier":
                        value = await resolveImportRef.current({
                            kind: "namespace",
                            path: node.source.value as string,
                        });
                        break;
                    case "ImportDefaultSpecifier":
                        value = await resolveImportRef.current({
                            kind: "default",
                            path: node.source.value as string,
                        });
                        break;
                    case "ImportSpecifier":
                        value = await resolveImportRef.current({
                            kind: "named",
                            path: node.source.value as string,
                            variable: specifier.imported.name,
                        });
                        break;
                    default:
                        continue thisSpecifierMark;
                }
                newScope[specifier.local.name] = value;
            }
        })
            .then((value) => {
                if (isUnmountedRef.current) {
                    // Avoid calling `setVFile` when unmounted
                    return;
                }
                setScope(newScope);
                setVFile(value);
            })
            .catch(() => {}) // TODO: handle error
            .then(() => {
                if (isUnmountedRef.current) {
                    // Avoid creating a loop when unmounted
                    return;
                }
                callCompileCode();
            });
    }, []);

    React.useMemo(() => {
        const isQueueEmpty = computingQueueRef.current === null;

        computingQueueRef.current = {
            code,
            recmaPlugins,
            rehypePlugins,
            remarkPlugins,
        };

        if (isQueueEmpty) {
            // Only call the compilation when the queue is empty
            // When it's not empty, the function will call itself when it's done, so no need to call it
            callCompileCode();
        }
    }, [code, recmaPlugins, rehypePlugins, remarkPlugins]);

    if (!vfile) {
        return { scope: {}, text: "" };
    }

    return { scope: { ...defaultScope, ...scope }, text: vfile.toString() };
};

function compileCode(
    {
        code,
        recmaPlugins,
        rehypePlugins,
        remarkPlugins,
    }: Pick<
        UseMDXParams,
        "code" | "recmaPlugins" | "rehypePlugins" | "remarkPlugins"
    >,
    handleImports: (importNode: ImportDeclaration) => Promise<void>,
) {
    return compile(code, {
        outputFormat: "function-body",
        recmaPlugins,
        rehypePlugins,
        remarkPlugins: [
            ...(remarkPlugins || []),
            () => async (tree) => {
                const promises: Array<Promise<any>> = [];
                const mdxjsEsms = selectAll("mdxjsEsm", tree);
                for (const mdxjsEsm of mdxjsEsms) {
                    // @ts-expect-error
                    const body = mdxjsEsm.data!.estree.body;
                    for (let index = body.length - 1; index >= 0; index--) {
                        const node = body[index];
                        if (node.type === "ImportDeclaration") {
                            body.splice(index, 1);
                            mdxjsEsm.value =
                                (mdxjsEsm.value as string).substring(
                                    0,
                                    node.range[0] - 1, // range starts at 1
                                ) +
                                (mdxjsEsm.value as string).substring(
                                    node.range[1] - 1, // range starts at 1
                                );
                            promises.push(handleImports(node));
                        }
                    }
                }
                await Promise.all(promises);
            },
        ],
    });
}
