import test from "ava";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { renderHook } from "@testing-library/react-hooks";

import { useMDX } from "./use-mdx.js";

test("it properly detects imports", async (t) => {
    const { result, waitFor } = renderHook(() => {
        return useMDX({
            code: `
import A, { B, C as D } from 'foo';
import * as E from 'e';import F from 'f';

import G from 'g';
export const h = 1;

`,
            resolveImport: async (option) => {
                if (option.kind === "named") {
                    return `named-${option.variable}`;
                }
                return option.kind;
            },
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
    const { result, waitFor } = renderHook(() =>
        useMDX({
            code: `
import A from 'a';
`,
            defaultScope: { A: "default-scope" },
            resolveImport: async () => {
                return "detected";
            },
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
