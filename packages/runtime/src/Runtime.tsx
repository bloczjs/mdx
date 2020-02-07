import React from "react";
import MDX from "@mdx-js/runtime";

import { useMDX, UseMDXParams } from "./use-mdx";

export const Runtime: React.FunctionComponent<UseMDXParams> = ({
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
        <MDX scope={scope} components={components}>
            {text}
        </MDX>
    );
};
