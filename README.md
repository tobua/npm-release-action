# release-npm-action

<img align="right" src="https://github.com/tobua/release-npm-action/raw/main/logo.png" width="20%" alt="release-npm-action" />

GitHub action to version and document a plugin release to npm using [semantic-release](https://github.com/semantic-release/semantic-release).

- Creates tag for current version.
- GitHub release for tag with release notes based on commit messages.
- Publishes release to npm.
- Release triggered through `release-npm` commit annotation or manual run.
- No additional commits made.
- No version required in `package.json`.
- No project dependencies necessary.
- [npm provenance](#npm-provenance) support.

## Usage

Add steps to build and test before the release as usual.

```yaml
name: release

# Runs always on commits, will only release when requested, see below.
on:
  push:
    branches: [main]

jobs:
  test:
    # test step if necessary
  release:
    # needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # run build if necessary
      - uses: tobua/release-npm-action@v1
        with:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Request Release

### `release-npm` in Commit Body

To request the next commit to be released if the pipeline passes add a remark to the commit message.

```
feat(component): implement swipe and dot functionality for Intro

release-npm
```

If a `release-npm` token is found in the body a release will be triggered. Patch, minor or major release type will be decided based on the commit history.

```
fix(component): improve swipe behavior [release-npm]
```

The annotation can be placed anywhere in the commit message.

### Manually Triggered Workflow

Alternatively, a release can be manually triggered without annotated commits. This requires the action to run on the `workflow_dispatch` trigger. When that is added a workflow can be triggered from the GitHub workflow UI for this action. The UI dialogue will prompt for an input which is set to 'regular' by default and when submitted with this value will trigger a manual release.

```yaml
name: push

# Runs always on commits, will only release when requested, see below.
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      manual:
        description: Manually trigger regular release?
        default: regular
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # ...
      - uses: tobua/release-npm-action@v1
        with:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          # Hand over manual input trigger.
          MANUAL_TRIGGER: ${{ github.event.inputs.manual }}
```

## Options / Inputs

The following options can be passed to the action.

| Option         | Values    | Required | Description                                                                                 |
| -------------- | --------- | -------- | ------------------------------------------------------------------------------------------- |
| NPM_TOKEN      | string    | true     | npm Automation or Publishing token.                                                         |
| GITHUB_TOKEN   | string    | false    | GitHub token automatically created by GitHub, defaults to repository scoped token.          |
| MANUAL_TRIGGER | 'regular' | false    | Manually trigger a release even without commit annotation.                                  |
| CHANNEL        | string    | false    | dist-tag to publish the npm release on, default latest.                                     |
| DRY_RUN        | 'true'    | false    | Release in dry mode (no publish).                                                           |
| DEBUG          | 'true'    | false    | Run in debug mode.                                                                          |
| FAIL_ON_SKIP   | 'false'   | false    | Disable action failing when release requested but not published due to no relevant changes. |
| FOLDER         | string    | false    | Optional folder where the package to publish resides. Plugin only works with one package.   |

`version`, `channel` and `tag` are available as output variables after a successful release.

## npm Provenance

In order to publish your package with the contents signed have been built on GitHub in the linked repository add the following npm `publishConfig` to the `package.json`.

```json
{
  "publishConfig": {
    "provenance": true
  }
}
```

In your action make sure that the non-default `id-token` permission is enabled along with the `contents` permission. To use the provenance feature make sure to update npm to the latest version before publishing.

```yml
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required to mint token for npm package provenance
      contents: write # Needed to create and write release notes in GitHub release
    steps:
      - uses: actions/checkout@v3
      # Important: Requires at least npm v9.5 (Included in Node.js >= 20)
      - run: npm install -g npm@latest
      # ...
      - uses: tobua/release-npm-action@v2
        with:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Caveats

The first version for a plugin release defaults to `1.0.0` and cannot be changed. The next version is based on the commit history since the latest release and also cannot be changed.

**Workaround** To publish the first release below create an empty tag with a version below the one desired. So, to start publishing at `0.1.0` create a `v0.0.1` tag on an earlier commit after which there are commits with `feature` which bumps the minor.

## Troubleshooting

`There are no relevant changes, so no new version is released.` This happens if the commits since the last release don't contain any changes that would make it into the release. Note that commits with `ci` type don't need a release as by convention this only touches CI files which aren't published.

If you run into any issues with the action the likely cause is with `semantic-release`. You can try it out locally by running `npx semantic-release --branches main --dry-run --no-ci` without publishing anything.
