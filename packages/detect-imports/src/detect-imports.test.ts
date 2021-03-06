import { detectImports } from "./detect-imports";

describe("Detect imports in JSX", () => {
    it("Should detect default imports", async () => {
        expect(
            await detectImports(`
                import A from './a';
                import B
                    from 'b'
            `),
        ).toEqual([
            {
                imports: [
                    {
                        imported: "default",
                        local: "A",
                    },
                ],
                module: "./a",
            },
            {
                imports: [
                    {
                        imported: "default",
                        local: "B",
                    },
                ],
                module: "b",
            },
        ]);
    });
    it("Should detect named imports", async () => {
        expect(
            await detectImports(`
                import { a, A as As } from './a';
                import { B,
                    b } from 'b'

                const nonImport = 'nonImport';
            `),
        ).toEqual([
            {
                imports: [
                    {
                        imported: "a",
                        local: "a",
                    },
                    {
                        imported: "A",
                        local: "As",
                    },
                ],
                module: "./a",
            },
            {
                imports: [
                    {
                        imported: "B",
                        local: "B",
                    },
                    {
                        imported: "b",
                        local: "b",
                    },
                ],
                module: "b",
            },
        ]);
    });
    it("Should detect both default and named imports", async () => {
        expect(
            await detectImports(`
                import a, { A, As as AS } from './a';
                import { B,
                    default as Bb,
                    b } from 'b'
            `),
        ).toEqual([
            {
                imports: [
                    {
                        imported: "default",
                        local: "a",
                    },
                    {
                        imported: "A",
                        local: "A",
                    },
                    {
                        imported: "As",
                        local: "AS",
                    },
                ],
                module: "./a",
            },
            {
                imports: [
                    {
                        imported: "B",
                        local: "B",
                    },
                    {
                        imported: "default",
                        local: "Bb",
                    },
                    {
                        imported: "b",
                        local: "b",
                    },
                ],
                module: "b",
            },
        ]);
    });
    it("Should fail", async () => {
        expect(
            detectImports(`
                import b, B from 'b'
            `),
        ).rejects.toThrowError();
    });
});
