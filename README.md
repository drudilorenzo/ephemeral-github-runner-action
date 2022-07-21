#  Javascript github action to deploy and destroy self-hosted runners. 

<p align="center">
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

## Code in Main

Install the dependencies

```bash
npm install
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! 

## Usage

You can now consume the action by referencing the v1 branch

```yaml
 - uses: LorenzoDrudi/ephemeral-github-runner-action@refactoring
    with:
      pulumi-config-path: 'Path to the config file'
      pulumi-goal: 'Goal name (create/destroy)'
      pulumi-stack-name: 'Stack name'
      pulumi-cloud-provider: 'Provider (aws/gcp)'
      pulumi-config-passphrase: 'A passphrase used by pulumi to encrypt your secrets'
      cloud-architecture: 'The machine architecture (amd64/arm64)'
      pulumi-backend-url: 'The pulumi backend url'
      github-app-id: 'Github app id'
      github-app-private-key: 'Github app private key'
      aws-access-key-id: 'Aws access key id'
      aws-secret-access-key: 'Aws secret access key'
      aws-region: 'Aws region'
```


