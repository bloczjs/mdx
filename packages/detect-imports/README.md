# TL;DR

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
