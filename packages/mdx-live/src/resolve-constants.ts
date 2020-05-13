import * as React from "react";

export interface Variables {
    [key: string]: any;
}

export const resolveConstants = (
    variables: Variables,
    constants: Variables,
) => {
    const parsedConstants: Variables = {};
    const fullScope = { ...variables };

    Object.keys(constants).forEach((constantName) => {
        try {
            const fn = new Function(
                "_fn",
                "React",
                ...Object.keys(fullScope),
                `${constants[constantName]};
                return ${constantName}`,
            );

            const value = fn({}, React, ...Object.values(fullScope));

            parsedConstants[constantName] = value;
            fullScope[constantName] = value;
        } catch (error) {
            console.error(error);
        }
    });

    return parsedConstants;
};
