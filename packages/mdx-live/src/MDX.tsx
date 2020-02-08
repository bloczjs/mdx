import React from "react";
import MDXRuntime from "@mdx-js/runtime";

import { useMDX, UseMDXParams, UseMDXOut } from "./use-mdx";

// @ts-ignore
const DefaultProvider: React.Provider<UseMDXOut> = ({ value, children }) => (
    <>{children}</>
);

interface MDXProps extends UseMDXParams {
    Provider?: React.Provider<UseMDXOut>;
}

export const MDX: React.FunctionComponent<MDXProps> = ({
    Provider = DefaultProvider,
    code,
    defaultScope,
    resolveImport,
}) => {
    const { scope, components, text } = useMDX({
        code,
        defaultScope,
        resolveImport,
    });
    return (
        <Provider value={{ scope, components, text }}>
            <MDXRuntime scope={scope} components={components}>
                {text}
            </MDXRuntime>
        </Provider>
    );
};
