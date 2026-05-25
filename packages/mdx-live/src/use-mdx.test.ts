import test from "node:test";
import assert from "node:assert/strict";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { renderHook, waitFor } from "@testing-library/react";

import { useMDX } from "./use-mdx.js";
import type { UseMDXOut, ResolveImport } from "./use-mdx";
import { snapshotDetectsImports } from "./use-mdx.test.snap.js";

test("it properly detects imports", async () => {
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

    assert.deepEqual(result.current.resolvedImports, {
        A: "default",
        B: "named-B",
        D: "named-C",
        E: "namespace",
        F: "default",
        G: "default",
    });

    assert.equal(result.current.text, snapshotDetectsImports);
    assert.ok(result.current.text.includes("\nconst h = 1;\n"));

    assert.equal(renderCount, 3); // 3 because: initial, compilation of the file, resolving of imports
});

test("it uses the most up-to-date resolveImport", async () => {
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

    assert.deepEqual(result.current.resolvedImports, { A: "initial" });

    resolveImport = async () => {
        return "updated";
    };
    rerender();
    assert.equal(renderCount, 4);
    const initialValue = result.current.resolvedImports;
    await waitFor(() => {
        if (result.current.resolvedImports === initialValue) {
            throw new Error("Resolved imports are the same");
        }
    });

    assert.deepEqual(result.current.resolvedImports, {
        A: "updated",
    });
    assert.equal(renderCount, 5); // switches from 4 to 5 so no useless re-renders
});

test("it doesn’t recompile at each change, but in batches", async () => {
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

    assert.equal(allResults.length, 4);

    await waitFor(() => {
        if (!result.current.text.includes("const D = 'D';")) {
            throw new Error("Text does not include D");
        }
    });

    assert.equal(allResults.length, 6); // only 2 renders were added: the resolutions of the scope (twice), full render of A & B aren’t generating re-renders
    assert.equal(allResults[3].text, "");
    assert.ok(allResults[4].text.includes("const D = 'D'"));
    assert.ok(allResults[5].text.includes("const D = 'D'"));
});
