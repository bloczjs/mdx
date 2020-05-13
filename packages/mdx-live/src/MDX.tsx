import React from "react";
import MDXRuntime from "@mdx-js/react";

import { useMDX, UseMDXParams, UseMDXOut } from "./use-mdx";

export type MDXContextType = UseMDXOut;

// @ts-ignore
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
