# Changelog

## v0.2

### 0.2.0

### `@blocz/mdx-live`

-   Upgrade for MDX 2 **BREAKING CHANGE**
-   Switch to ESM only (it depends on `@mdx-js/mdx` that also switched to ESM only) **BREAKING CHANGE**
-   Add peer dependency on `@mdx-js/mdx` **BREAKING CHANGE**
-   Add support for `recmaPlugins` in addition to `rehypePlugins` and `remarkPlugins` in `MDX` props
-   `useMDX` can accept all kind of plugins
-   Add `isReady` in `useMDX` return object
-   Bundle size was reduced from [1.6 MB](https://bundlephobia.com/package/@blocz/mdx-live@0.1.0) to [23.7 kB](https://bundlephobia.com/package/@blocz/mdx-live@0.2.0-rc.2) (-98.5%)

### `@blocz/mdx-plugin-detect-imports`

-   Update for MDX 2 (but still in CJS, and compatible in ESM)
-   Can only be used in MDX async function (like `compile`) but not the sync ones (like `compileSync`)
-   Change format of `ImportStatement` to better represent named vs default exports:

    In v0.1.0:

    ```ts
    interface ImportStatement {
        module: string;
        imports: Array<{
            imported: string;
            local: string;
            value: any;
        }>;
    }
    ```

    Now in v0.2.0:

    ```ts
    interface ImportStatement {
        module: string;
        imports: Array<
            | {
                  kind: "named";
                  imported: string;
                  local: string;
                  value: any;
              }
            | {
                  kind: "namespace" | "default";
                  local: string;
                  value: any;
              }
        >;
    }
    ```

### `@blocz/detect-imports`

Removed because no longer needed

### `@blocz/mdx-loader`

Removed because already fully covered by the recommended `@mdx-js/loader` + `@blocz/mdx-plugin-detect-imports` plugin

### Other changes

-   Upgraded to yarn v3.2.1
-   Add support for node 18 in addition to node 16
-   Add a few e2e tests

**Full changelog**: https://github.com/bloczjs/mdx/compare/v0.1.0...v0.2.0

<details>
  <summary>See detailed changelog</summary>

#### 0.2.0-rc.3

-   switch `@blocz/mdx-plugin-detect-imports` to a mix of CJS + ESM which makes it async
    and so it now cannot be used anymore with `mdx.compileSync`, only `await mdx.compile` **BREAKING CHANGE**
-   `@blocz/mdx-plugin-detect-imports` generates a proper AST for the exported variable

#### 0.2.0-rc.2

-   Update `microbundle` in https://github.com/bloczjs/mdx/pull/32
-   Update GH actions & add support for node 18 in https://github.com/bloczjs/mdx/pull/33
-   Mark `@mdx-js/mdx` as peer dependency in https://github.com/bloczjs/mdx/pull/34

**Changelog**: https://github.com/bloczjs/mdx/compare/v0.2.0-rc.1...v0.2.0-rc.2

#### 0.2.0-rc.1

-   Update top level README and add a new CONTRIBUTING.md in https://github.com/bloczjs/mdx/pull/22
-   Update prettier in https://github.com/bloczjs/mdx/pull/23
-   Move top level scripts in https://github.com/bloczjs/mdx/pull/24
-   Update various dependencies in https://github.com/bloczjs/mdx/pull/25
-   Update package.json's keywords for all repos in https://github.com/bloczjs/mdx/pull/26
-   Add tests for `esbuild` in https://github.com/bloczjs/mdx/pull/28
-   Add tests for `rollup` in https://github.com/bloczjs/mdx/pull/31

**Changelog**: https://github.com/bloczjs/mdx/compare/v0.2.0-rc...v0.2.0-rc.1

#### 0.2.0-rc.0

Upgrade for MDX 2 in https://github.com/bloczjs/mdx/pull/20:

-   `@blocz/mdx-live` (ESM only)
-   `@blocz/mdx-plugin-detect-imports` (CJS only)

Remove because no longer required for MDX 2 in https://github.com/bloczjs/mdx/pull/20:

-   `@blocz/detect-imports`

Remove because no longer used in https://github.com/bloczjs/mdx/pull/20:

-   `@blocz/mdx-loader`

Also:

-   minor: regenerate yarn.lock in https://github.com/bloczjs/mdx/pull/19
-   minor: upgrade to yarn `v3.2.1` in https://github.com/bloczjs/mdx/pull/20

**Changelog**: https://github.com/bloczjs/mdx/compare/v0.1.0...v0.2.0-rc

</details>
