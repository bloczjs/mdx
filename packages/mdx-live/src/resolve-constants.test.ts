import { resolveConstants } from "./resolve-constants";

it("Parse everything", async () => {
    expect(
        resolveConstants(
            {
                a: 1,
                b: (x: number) => x * 2,
            },
            {
                c: `const c = b(a)`,
                d: `const d = c / 10`,
            },
        ),
    ).toEqual({
        c: 2,
        d: 0.2,
    });
});
