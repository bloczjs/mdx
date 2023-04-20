import * as React from "react";

import * as ReactRuntime from "react/jsx-runtime";

import { useMDX, Variables } from "./use-mdx.js";
import type { UseMDXParams, ResolveImport } from "./use-mdx";

export interface MDXContextType {
    scope: Variables;
    text: string;
    isReady: boolean;
}
export type { ResolveImport };

// @ts-expect-error
const DefaultProvider: React.Provider<MDXContextType> = ({ children }) => (
    <>{children}</>
);

type Components = import("mdx/types").MDXComponents;
type MergeComponents = (currentComponents: Components) => Components;
type UseMDXComponents = (
    components?: Components | MergeComponents | undefined,
) => Components;

interface MDXProps extends Omit<UseMDXParams, "providerImportSource"> {
    /** **Needs to be memoized** */
    defaultScope?: Variables;
    Provider?: React.Provider<MDXContextType>;
    useMDXComponents?: UseMDXComponents;
}

export const MDX: React.FunctionComponent<MDXProps> = ({
    Provider = DefaultProvider,
    code,
    defaultScope,
    useMDXComponents,
    resolveImport,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
}) => {
    const { resolvedImports, text, isReady } = useMDX({
        code,
        resolveImport,
        providerImportSource: useMDXComponents
            ? "something different than empty string"
            : undefined,
        recmaPlugins,
        rehypePlugins,
        remarkPlugins,
    });

    const scope = React.useMemo(
        // The `resolvedImports` need to be able to override the defaultScope
        () => ({ ...defaultScope, ...resolvedImports }),
        [defaultScope, resolvedImports],
    );

    const compiled = React.useMemo(() => {
        if (!text) {
            return () => null;
        }
        const fn = new Function(
            "__first_argument__",
            ...Object.keys(scope),
            text,
        );
        return fn(
            { ...ReactRuntime, useMDXComponents },
            ...Object.values(scope),
        );
    }, [text, scope]);

    if (!isReady) {
        return null;
    }

    const { default: Runtime, ...otherExports } = compiled;

    return (
        <Provider
            value={{
                scope: { ...scope, ...otherExports },
                text,
                isReady,
            }}
        >
            <Runtime components={scope} />
        </Provider>
    );
};
