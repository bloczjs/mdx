import test from "ava";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { renderHook } from "@testing-library/react-hooks";

import { useMDX } from "./use-mdx.js";
import type { UseMDXOut, ResolveImport } from "./use-mdx";

test("it properly detects imports", async (t) => {
    const resolveImport: ResolveImport = async (option) => {
        if (option.kind === "named") {
            return `named-${option.variable}`;
        }
        return option.kind;
    };
    const { result, waitFor } = renderHook(() => {
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

    await waitFor(() => result.current.text !== "");

    t.deepEqual(
        {
            A: "default",
            B: "named-B",
            D: "named-C",
            E: "namespace",
            F: "default",
            G: "default",
        } as Record<string, any>,
        result.current.resolvedImports,
    );

    t.snapshot(result.current.text, "Text result");
    t.true(result.current.text.includes("\nconst h = 1;\n"));

    t.is(3, result.all.length); // 3 because: initial, compilation of the file, resolving of imports
});

test("it uses the most up-to-date resolveImport", async (t) => {
    let resolveImport = async () => {
        return "initial";
    };
    const { result, waitFor, rerender, waitForValueToChange } = renderHook(() =>
        useMDX({
            code: `
import A from 'a';
`,
            resolveImport,
        }),
    );

    await waitFor(() => result.current.text !== "");

    t.deepEqual(
        {
            A: "initial",
        } as Record<string, any>,
        result.current.resolvedImports,
    );

    resolveImport = async () => {
        return "updated";
    };
    rerender();
    t.is(4, result.all.length);
    await waitForValueToChange(() => result.current.resolvedImports);

    t.deepEqual(
        {
            A: "updated",
        } as Record<string, any>,
        result.current.resolvedImports,
    );
    t.is(5, result.all.length); // switches from 4 to 5 so no useless re-renders
});

test("it doesn’t recompile at each change, but in batches", async (t) => {
    let code = `export const A = 'A';`;
    const { result, rerender, waitFor } = renderHook(() =>
        useMDX({
            code,
        }),
    );

    code = `export const B = 'B';`;
    rerender();

    code = `export const C = 'C';`;
    rerender();

    code = `export const D = 'D';`;
    rerender();

    t.is(4, result.all.length);

    await waitFor(() => result.current.text.includes("const D = 'D';"));

    t.is(8, result.all.length); // only 3 renders were added: the parsing of A, the parsing of D, and the resolutions of the scope (twice)
    t.is("", (result.all[3] as UseMDXOut).text);
    t.true((result.all[4] as UseMDXOut).text.includes("const A = 'A'"));
    t.true((result.all[5] as UseMDXOut).text.includes("const A = 'A'"));
    t.true((result.all[6] as UseMDXOut).text.includes("const D = 'D'"));
    t.true((result.all[7] as UseMDXOut).text.includes("const D = 'D'"));
});
