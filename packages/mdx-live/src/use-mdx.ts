import * as React from "react";

import { compile } from "@mdx-js/mdx";
import type { CompileOptions } from "@mdx-js/mdx";
import type { VFile } from "vfile";
import type { ImportDeclaration } from "estree";

import { selectAll } from "unist-util-select";

export interface Variables {
    [key: string]: any;
}

export interface UseMDXParams {
    code: string;
    defaultScope?: Variables;
    /** **Needs to be memoized** */
    resolveImport?: (
        option:
            | { kind: "named"; path: string; variable: string }
            | { kind: "namespace" | "default"; path: string },
    ) => Promise<any>;
    /** **Needs to be memoized** */
    recmaPlugins?: CompileOptions["recmaPlugins"];
    /** **Needs to be memoized** */
    rehypePlugins?: CompileOptions["rehypePlugins"];
    /** **Needs to be memoized** */
    remarkPlugins?: CompileOptions["remarkPlugins"];
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
    const [parsedFile, setParsedFile] = React.useState<
        readonly [VFile, ImportDeclaration[]] | undefined
    >(undefined);
    const computingQueueRef = React.useRef<
        Parameters<typeof compileCode>[0] | null
    >(null);

    const isUnmountedRef = React.useRef(false);
    React.useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
        };
    }, []);

    const callCompileCode = React.useCallback(() => {
        if (!computingQueueRef.current) {
            return;
        }

        const computingParams = computingQueueRef.current;
        computingQueueRef.current = null;

        compileCode(computingParams)
            .then((value) => {
                if (isUnmountedRef.current) {
                    // Avoid calling `setVFile` when unmounted
                    return;
                }
                setParsedFile(value);
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

    const [scope, setScope] = React.useState<Variables>({});
    React.useEffect(() => {
        if (!parsedFile) {
            return;
        }

        let isOutdated = false;

        const generateScope = async () => {
            const newScope: Variables = {};
            for (const node of parsedFile[1]) {
                for (const specifier of node.specifiers) {
                    switch (specifier.type) {
                        case "ImportNamespaceSpecifier":
                            newScope[specifier.local.name] =
                                await resolveImport({
                                    kind: "namespace",
                                    path: node.source.value as string,
                                });
                            break;
                        case "ImportDefaultSpecifier":
                            newScope[specifier.local.name] =
                                await resolveImport({
                                    kind: "default",
                                    path: node.source.value as string,
                                });
                            break;
                        case "ImportSpecifier":
                            newScope[specifier.local.name] =
                                await resolveImport({
                                    kind: "named",
                                    path: node.source.value as string,
                                    variable: specifier.imported.name,
                                });
                            break;
                    }
                }
            }

            if (isOutdated) {
                return;
            }
            setScope(newScope);
        };

        generateScope();

        return () => {
            isOutdated = true;
        };
    }, [resolveImport, parsedFile]);

    if (!parsedFile) {
        return { scope: {}, text: "" };
    }

    return {
        scope: { ...defaultScope, ...scope },
        text: parsedFile[0].toString(),
    };
};

function compileCode({
    code,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
}: Pick<
    UseMDXParams,
    "code" | "recmaPlugins" | "rehypePlugins" | "remarkPlugins"
>) {
    const importDeclarations: ImportDeclaration[] = [];
    return compile(code, {
        outputFormat: "function-body",
        recmaPlugins,
        rehypePlugins,
        remarkPlugins: [
            ...(remarkPlugins || []),
            () => async (tree) => {
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

                            importDeclarations.push(node);
                        }
                    }
                }
            },
        ],
    }).then((vfile) => [vfile, importDeclarations] as const);
}
