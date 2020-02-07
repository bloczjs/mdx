import * as React from "react";

export interface Variables {
    [key: string]: any;
}

export const resolveConstants = (
    variables: Variables,
    constants: Variables,
) => {
    const parsedConstants: Variables = {};

    Object.keys(constants).forEach(constantName => {
        const fullScope = { ...variables, ...parsedConstants };

        try {
            const fn = new Function(
                "_fn",
                "React",
                ...Object.keys(fullScope),
                `${constants[constantName]};
                return ${constantName}`,
            );

            parsedConstants[constantName] = fn(
                {},
                React,
                ...Object.values(fullScope),
            );
        } catch (error) {
            console.error(error);
        }
    });

    return parsedConstants;
};
