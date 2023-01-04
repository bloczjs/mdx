# How to Develop <!-- omit in toc -->

-   [Commands](#commands)
    -   [Install](#install)
    -   [Build](#build)
    -   [Test](#test)
    -   [Format](#format)
        -   [Check](#check)
        -   [Fix](#fix)
    -   [Deploy](#deploy)
        -   [Login](#login)
        -   [Deploy a version](#deploy-a-version)
-   [Pull requests](#pull-requests)
-   [Branch Name Convention](#branch-name-convention)
-   [Commit Convention](#commit-convention)
    -   [Format](#format-1)
    -   [Version Types](#version-types)

## Commands

### Install

```bash
yarn install
```

### Build

Build all packages in the correct order:

```bash
yarn build
```

### Test

Run all tests

```bash
yarn test
```

### Format

#### Check

To check that the format is correct is the whole codebase

```bash
yarn format:check
```

#### Fix

To auto fix all formatting issues

```bash
yarn format:fix
```

### Deploy

#### Login

All of those commands depends on yarn. So you need to be logged into NPM with yarn

```bash
yarn npm login
```

#### Deploy a version

To deploy a specific version

```bash
yarn deploy -v $VERSION
# Example: yarn deploy -v 0.2.0-beta.3
```

And if you want to add an NPM tag (like `next`)

```bash
yarn deploy -v $VERSION --tag $TAG
# Example: yarn deploy -v 0.2.0-beta.3 --tag next
```

## Pull requests

Before opening a PR, we should need to open an issue so that you can get a `taskId` (otherwise you can try to guess the next PR id).

All changes are made in a specific branch. When you are done with your changes you can create a pull request.

Each pushed commit will trigger a Github Action that will run tests. All tests has to pass before it is possible to merge a pull request.

## Branch Name Convention

`task/{taskId}-{taskDescription}`

## Commit Convention

In order to determine which version type a package should be released with and to be able to generate release notes, commits has to follow a certain format.

### Format

`#{taskId}@{versionType}: {description}`

### Version Types

You can pick between:

-   `dev`
-   `patch`
-   `minor`
-   `major`

<!--

| Type  | Description                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| dev   | Use this version type if the change doesn’t affect the end user. The change will not be displayed in the release notes |
| patch | Bug fixes should use this version type                                                                                 |
| minor | New features that doesn’t break anything for the end user should have this version type                                |
| major | Braking changes should use this version type                                                                           |

-->
