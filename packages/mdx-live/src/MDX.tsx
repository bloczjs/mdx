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

    const compiled = React.useMemo(() => {
        if (!text) {
            return () => null;
        }
        const fn = new Function(text);
        return fn(ReactRuntime);
    }, [text]);

    if (!isReady) {
        return null;
    }

    const { default: Runtime, ...otherExports } = compiled;

    return (
        <Provider
            value={{ scope: { ...scope, ...otherExports }, text, isReady }}
        >
            <Runtime components={scope} />
        </Provider>
    );
};
