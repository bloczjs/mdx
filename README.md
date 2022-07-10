# @blocz/mdx

## Commands

-   `yarn build`: build all packages in the correct order
-   `yarn test`: run all tests
-   `yarn deploy`: deploy all packages
    -   For `next` version, `yarn deploy -v 0.2.0-beta.3 --tag next`
    -   For stable version: `yarn deploy -v 0.2.0`
    -   For both of those operations, you need to be logged in with `yarn npm login`
-   `yarn format:check`: to check the format of the code
-   `yarn format:fix`: to format the code

## ToDo

-   [x] detect import statements
-   [x] create a MDX loader that parse the content, detect the imports and add them to a scope
-   [x] create a runtime tool that parse, render it's content, load imports based on a given scope and load export statements
