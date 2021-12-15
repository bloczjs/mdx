import React from "react";
import * as mdxReact from "@mdx-js/react";

import { useMDX, UseMDXParams, UseMDXOut } from "./use-mdx";
import { compileMDX } from "./compile-mdx";
import { Variables } from "./resolve-constants";

export type MDXContextType = UseMDXOut;

// @ts-ignore
const DefaultProvider: React.Provider<MDXContextType> = ({ children }) => (
    <>{children}</>
);

const Runtime: React.FunctionComponent<{
    scope: Variables;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    code: string;
}> = ({
    scope = {},
    remarkPlugins = [],
    rehypePlugins = [],
    code,
    ...props
}) => {
    const fullScope = {
        ...scope,
        mdx: mdxReact.mdx,
        MDXProvider: mdxReact.MDXProvider,
        components: scope,
        props,
    };

    const compiledCode = compileMDX({
        code,
        scope,
        remarkPlugins: remarkPlugins,
        rehypePlugins: rehypePlugins,
    });

    const keys = Object.keys(fullScope);
    const values = Object.values(fullScope);

    var fn = new Function(
        "_fn",
        "React",
        ...keys,
        `${compiledCode}\n\n    return React.createElement(MDXProvider, { components },\n      React.createElement(MDXContent, props)\n    );`,
    );

    return fn({}, React, ...values);
};

interface MDXProps extends UseMDXParams {
    Provider?: React.Provider<MDXContextType>;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
}

export const MDX: React.FunctionComponent<MDXProps> = ({
    Provider = DefaultProvider,
    code,
    defaultScope,
    resolveImport,
    remarkPlugins,
    rehypePlugins,
}) => {
    const { scope, text } = useMDX({
        code,
        defaultScope,
        resolveImport,
    });

    return (
        <Provider value={{ scope, text }}>
            <Runtime
                scope={scope}
                code={text}
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
            />
        </Provider>
    );
};
