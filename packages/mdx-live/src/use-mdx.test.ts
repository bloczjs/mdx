import test from "ava";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { renderHook } from "@testing-library/react-hooks";

import { useMDX } from "./use-mdx.js";
import type { UseMDXOut } from "./use-mdx.js";

test("it properly detects imports", async (t) => {
    const resolveImport: Parameters<typeof useMDX>[0]["resolveImport"] = async (
        option,
    ) => {
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
        result.current.scope,
    );

    t.snapshot(result.current.text, "Text result");
    t.true(result.current.text.includes("\nconst h = 1;\n"));

    t.is(3, result.all.length); // 3 because: initial, compilation of the file, resolving of imports
});

test("it merges defaultScope and detected scope", async (t) => {
    const { result, waitFor } = renderHook(() =>
        useMDX({
            code: `
import A from 'a';
`,
            defaultScope: { b: "b" },
        }),
    );

    await waitFor(() => result.current.text !== "");

    t.deepEqual(
        {
            A: undefined,
            b: "b",
        } as Record<string, any>,
        result.current.scope,
    );
});

test("it keeps detected scope instead of defaultScope during conflicts", async (t) => {
    const resolveImport = async () => {
        return "detected";
    };
    const { result, waitFor } = renderHook(() =>
        useMDX({
            code: `
import A from 'a';
`,
            defaultScope: { A: "default-scope" },
            resolveImport,
        }),
    );

    await waitFor(() => result.current.text !== "");

    t.deepEqual(
        {
            A: "detected",
        } as Record<string, any>,
        result.current.scope,
    );
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
        result.current.scope,
    );

    resolveImport = async () => {
        return "updated";
    };
    rerender();
    t.is(4, result.all.length);
    await waitForValueToChange(() => result.current.scope);

    t.deepEqual(
        {
            A: "updated",
        } as Record<string, any>,
        result.current.scope,
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
