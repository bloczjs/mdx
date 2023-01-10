import * as React from "react";

import * as ReactRuntime from "react/jsx-runtime.js";

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

interface MDXProps extends UseMDXParams {
    /** **Needs to be memoized** */
    defaultScope?: Variables;
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
    const { resolvedImports, text, isReady } = useMDX({
        code,
        resolveImport,
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
        const fn = new Function("React", ...Object.keys(scope), text);
        return fn(ReactRuntime, ...Object.values(scope));
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
