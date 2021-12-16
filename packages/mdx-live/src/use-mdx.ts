import * as React from "react";

import { parseMDX } from "./parse-mdx";
import { resolveConstants, Variables } from "./resolve-constants";

interface State {
    variables: Variables;
    constants: Variables;
    filteredText: string;
}

export interface UseMDXParams {
    code: string;
    defaultScope?: Variables;
    resolveImport?: (path: string, variable: string) => Promise<any>;
}
export interface UseMDXOut {
    scope: Variables;
    text: string;
}

const customError = new Error("fine");

export const useMDX = ({
    code,
    defaultScope = {},
    resolveImport = async () => undefined,
}: UseMDXParams): UseMDXOut => {
    const [state, setState] = React.useState<State>({
        variables: defaultScope,
        constants: {},
        filteredText: "",
    });

    React.useEffect(() => {
        let computedVariables = defaultScope;
        const isCancelled = { current: false };
        parseMDX(code)
            .then(async ({ constants, importDeclarations, filteredText }) => {
                for (const declaration of importDeclarations) {
                    for (const importStatement of declaration.imports) {
                        if (isCancelled.current) {
                            throw customError;
                        }
                        const value = await resolveImport(
                            declaration.module,
                            importStatement.imported,
                        );
                        if (value === undefined) {
                            console.warn(
                                `Variable "${importStatement.imported}" was not found in module "${declaration.module}"`,
                            );
                            throw customError;
                        }
                        computedVariables = {
                            ...computedVariables,
                            [importStatement.local]: value,
                        };
                    }
                }
                if (isCancelled.current) {
                    throw customError;
                }
                setState({
                    variables: computedVariables,
                    constants,
                    filteredText,
                });
            })
            .catch((error) => {
                isCancelled.current = true;
                if (error === customError) {
                    return;
                }
                console.warn(error);
            });
        return () => {
            isCancelled.current = true;
        };
    }, [code]);

    const scope = {
        ...state.variables,
        ...resolveConstants(state.variables, state.constants),
    };

    return { scope, text: state.filteredText };
};
