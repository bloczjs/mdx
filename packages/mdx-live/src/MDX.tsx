import React from "react";
import MDXRuntime from "@mdx-js/runtime";

import { useMDX, UseMDXParams } from "./use-mdx";

export const MDX: React.FunctionComponent<UseMDXParams> = ({
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
        <MDXRuntime scope={scope} components={components}>
            {text}
        </MDXRuntime>
    );
};
