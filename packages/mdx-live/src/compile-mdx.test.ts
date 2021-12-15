import { compileMDX } from "./compile-mdx";

describe("compile-mdx", () => {
    it("works with un-scoped variables", () => {
        const unscoped = compileMDX({
            code: "<Unscoped />",
            scope: {},
        });

        // Unscoped is flagged as shortcode
        expect(unscoped).toContain(
            'const Unscoped = makeShortcode("Unscoped");',
        );
        // no import statement
        expect(unscoped).not.toContain("import {");
        // still includes the rendered component
        expect(unscoped).toContain('mdx( Unscoped, { mdxType: "Unscoped" })');
    });

    it("works with scoped code", () => {
        const scoped = compileMDX({
            code: "<Scoped />",
            scope: { Scoped: () => null },
        });

        // Scoped isn't flagged as shortcode
        expect(scoped).not.toContain('const Scoped = makeShortcode("Scoped");');
        // no import statement
        expect(scoped).not.toContain("import { Scoped");
        // still includes the rendered component
        expect(scoped).toContain('mdx( Scoped, { mdxType: "Scoped" })');
    });
});
