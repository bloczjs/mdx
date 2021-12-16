# TL;DR

The goal of this library is to detect, in a JS code, the import statements, and parse them.

This is supposed to be used with MDX 1, so TypeScript is not supposed to be parsed (so syntaxes like `import type` or `import { type A }` won't be supported).

## How to use:

### Signature

```ts
detectImports(code: string): Promise<ImportDeclaration[]>
```

### Example

```js
import { detectImports } from "@blocz/detect-imports";

const string = `
import { a, A as As } from './a';
import { B,
    b } from 'b'

const nonImport = 'nonImport';
`;

await detectImports(string);
// This will return:
// [
//     {
//         imports: [
//             {
//                 imported: "a",
//                 local: "a",
//             },
//             {
//                 imported: "A",
//                 local: "As",
//             },
//         ],
//         module: "./a",
//     },
//     {
//         imports: [
//             {
//                 imported: "B",
//                 local: "B",
//             },
//             {
//                 imported: "b",
//                 local: "b",
//             },
//         ],
//         module: "b",
//     },
// ];
```
