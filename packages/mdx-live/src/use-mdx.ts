import * as React from "react";

import { compile } from "@mdx-js/mdx";
import type { CompileOptions } from "@mdx-js/mdx";
import type { VFile } from "vfile";
import type { ImportDeclaration } from "estree";

import { selectAll } from "unist-util-select";

export interface Variables {
    [key: string]: any;
}

export type ResolveImport = (
    option:
        | { kind: "named"; path: string; variable: string }
        | { kind: "namespace" | "default"; path: string },
) => Promise<any>;

export interface UseMDXParams {
    code: string;
    defaultScope?: Variables;
    /** **Needs to be memoized** */
    resolveImport?: ResolveImport;
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
    isReady: boolean;
}

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

        compileCode(computingParams)
            .then((value) => {
                if (isUnmountedRef.current) {
                    // Avoid calling `setVFile` when unmounted
                    return;
                }
                setParsedFile(value);
            })
            .catch((error) => {
                // TODO: better handle error
                console.error(error);
            })
            .then(() => {
                // Only reset once it's done
                if (computingQueueRef.current === computingParams) {
                    computingQueueRef.current = null;
                }

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

    const scopeForParsedFileRef =
        React.useRef<WeakSet<Exclude<typeof parsedFile, undefined>>>();
    if (!scopeForParsedFileRef.current) {
        scopeForParsedFileRef.current = new WeakSet(); // Only compute it once
    }

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
            scopeForParsedFileRef.current!.add(parsedFile);
            setScope(newScope);
        };

        generateScope();

        return () => {
            isOutdated = true;
            // TODO: maybe add `scopeForParsedFileRef.current.delete(parsedFile);`
        };
    }, [resolveImport, parsedFile]);

    if (!parsedFile) {
        return { scope: {}, text: "", isReady: false };
    }

    return {
        scope: { ...defaultScope, ...scope },
        text: parsedFile[0].toString(),
        isReady: scopeForParsedFileRef.current.has(parsedFile),
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
                            // @ts-expect-error
                            mdxjsEsm.value =
                                // @ts-expect-error
                                (mdxjsEsm.value as string).substring(
                                    0,
                                    node.range[0] - 1, // range starts at 1
                                ) +
                                // @ts-expect-error
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
