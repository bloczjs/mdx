import * as React from "react";

import * as ReactRuntime from "react/jsx-runtime.js";

import { useMDX } from "./use-mdx.js";
import type { UseMDXParams, UseMDXOut, ResolveImport } from "./use-mdx";

export type MDXContextType = UseMDXOut;
export type { ResolveImport };

// @ts-expect-error
const DefaultProvider: React.Provider<MDXContextType> = ({ children }) => (
    <>{children}</>
);

interface MDXProps extends UseMDXParams {
    Provider?: React.Provider<MDXContextType>;
    ErrorBoundary?: React.ComponentType<{}>;
}

export const MDX: React.FunctionComponent<MDXProps> = ({
    Provider = DefaultProvider,
    code,
    defaultScope,
    resolveImport,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
}) => {
    const { scope, text, isReady } = useMDX({
        code,
        defaultScope,
        resolveImport,
        recmaPlugins,
        rehypePlugins,
        remarkPlugins,
    });

    const Runtime = React.useMemo(() => {
        if (!text) {
            return () => null;
        }
        const fn = new Function(text);
        return fn(ReactRuntime).default;
    }, [text]);

    if (!isReady) {
        return null;
    }

    return (
        <Provider value={{ scope, text, isReady }}>
            <Runtime components={scope} />
        </Provider>
    );
};
