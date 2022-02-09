import * as React from "react";
// import * as mdxReact from "@mdx-js/react";

import * as ReactRuntime from "react/jsx-runtime.js";

import { useMDX } from "./use-mdx.js";
import type { UseMDXParams, UseMDXOut, ResolveImport } from "./use-mdx";

export type MDXContextType = UseMDXOut;
export type { ResolveImport };

// @ts-expect-error
const DefaultProvider: React.Provider<MDXContextType> = ({ children }) => (
    <>{children}</>
);

class ErrorBoundary extends React.Component<{}, { error?: Error }> {
    state: { error?: Error } = {};

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidUpdate(prevProps: { children: React.ReactNode }) {
        if (prevProps.children !== this.props.children) {
            // Reset errors when children changes
            this.setState({ error: undefined });
        }
    }

    render() {
        const { error } = this.state;
        if (error) {
            // When the import resolution via `resolveImport` is getting done,
            // the variables aren't available yet. So it's making the whole tree crash.
            // We are only catching those errors, the others will bubble up regular errors.
            if (
                error.message.match(
                    /Expected component `[^`]*?` to be defined: you likely forgot to import, pass, or provide it\./,
                )
            ) {
                return null;
            }
            throw error;
        }
        return this.props.children;
    }
}

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
    const { scope, text } = useMDX({
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

    return (
        <Provider value={{ scope, text }}>
            <ErrorBoundary>
                <Runtime components={scope} />
            </ErrorBoundary>
        </Provider>
    );
};
