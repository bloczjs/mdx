import test from "ava";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { renderHook, waitFor } from "@testing-library/react";

import { useMDX } from "./use-mdx.js";
import type { UseMDXOut, ResolveImport } from "./use-mdx";

test("it properly detects imports", async (t) => {
    const resolveImport: ResolveImport = async (option) => {
        if (option.kind === "named") {
            return `named-${option.variable}`;
        }
        return option.kind;
    };
    let renderCount = 0;
    const { result } = renderHook(() => {
        renderCount++;
        return useMDX({
            code: `
import A, { B, C as D } from 'foo';
import * as E from 'e';import F from 'f';

import G from 'g';
export const h = 1;

`,
            resolveImport,
        });
    });

    await waitFor(() => {
        if (result.current.text === "") {
            throw new Error("Text is empty");
        }
    });

    t.deepEqual(
        {
            A: "default",
            B: "named-B",
            D: "named-C",
            E: "namespace",
            F: "default",
            G: "default",
        },
        result.current.resolvedImports,
    );

    t.snapshot(result.current.text, "Text result");
    t.true(result.current.text.includes("\nconst h = 1;\n"));

    t.is(3, renderCount); // 3 because: initial, compilation of the file, resolving of imports
});

test("it uses the most up-to-date resolveImport", async (t) => {
    let resolveImport = async () => {
        return "initial";
    };
    let renderCount = 0;
    const { result, rerender } = renderHook(() => {
        renderCount++;
        return useMDX({
            code: `
import A from 'a';
`,
            resolveImport,
        });
    });

    await waitFor(() => {
        if (result.current.text === "") {
            throw new Error("Text is empty");
        }
    });

    t.deepEqual({ A: "initial" }, result.current.resolvedImports);

    resolveImport = async () => {
        return "updated";
    };
    rerender();
    t.is(4, renderCount);
    const initialValue = result.current.resolvedImports;
    await waitFor(() => {
        if (result.current.resolvedImports === initialValue) {
            throw new Error("Resolved imports are the same");
        }
    });

    t.deepEqual(
        {
            A: "updated",
        },
        result.current.resolvedImports,
    );
    t.is(5, renderCount); // switches from 4 to 5 so no useless re-renders
});

test("it doesn’t recompile at each change, but in batches", async (t) => {
    const allResults: UseMDXOut[] = [];
    const { result, rerender } = renderHook(
        ({ code }) => {
            const result = useMDX({
                code,
            });
            allResults.push({ ...result });
            return result;
        },
        {
            initialProps: {
                code: `export const A = 'A';`,
            },
        },
    );

    rerender({ code: `export const B = 'B';` });

    rerender({ code: `export const C = 'C';` });

    rerender({ code: `export const D = 'D';` });

    t.is(4, allResults.length);

    await waitFor(() => {
        if (!result.current.text.includes("const D = 'D';")) {
            throw new Error("Text does not include D");
        }
    });

    t.is(6, allResults.length); // only 2 renders were added: the resolutions of the scope (twice), full render of A & B aren’t generating re-renders
    t.is("", allResults[3].text);
    t.true(allResults[4].text.includes("const D = 'D'"));
    t.true(allResults[5].text.includes("const D = 'D'"));
});
