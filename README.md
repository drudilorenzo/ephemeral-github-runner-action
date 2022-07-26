# JavaScript Github Action to deploy and destroy self-hosted runners

## Prerequisites

Before starting make sure: 
- you have an account set up in either AWS or GCP.
- you have a github app linked to the repository where the runners have to work (Same repo of the one inside config.yaml file).
- you have a github access token (required only if the repository is private).
- you have a ready backend for the cloud provider you want to use ('s3://bucket_name' or 'gs://bucket_name').
- you have a machine image for the cloud provider you want to use.

## How to use with AWS

Create a file called config.yaml with following content:
```
config:
  ephemeral-github-runner:bootDiskSizeInGB: "100"
  ephemeral-github-runner:bootDiskType: pd-balanced
  ephemeral-github-runner:labels: <comma-separated list of runner labels>
  ephemeral-github-runner:machineImage: <path to the AWS AMI machine image with Github runner installed>
  ephemeral-github-runner:machineType: <machine type of your choice>
  ephemeral-github-runner:owner: <GitHub org or username under which the repo is>
  ephemeral-github-runner:repo: <GitHub repo name>
  ephemeral-github-runner:runnersCount: "1"
  
 ```
 
 It isn't mandatory to put the  config file in the root directory. Example: 'dir1/dir2/config.yaml.'

## How to use with GCP

Create a file called config.yaml with following content:

```
config:
  ephemeral-github-runner:bootDiskSizeInGB: "100"
  ephemeral-github-runner:bootDiskType: pd-balanced
  ephemeral-github-runner:labels: <comma-separated list of runner labels>
  ephemeral-github-runner:machineImage: <path to the GCP machine image with Github runner installed>
  ephemeral-github-runner:machineType: <machine type of your choice>
  ephemeral-github-runner:owner: <GitHub org or username under which the repo is>
  ephemeral-github-runner:repo: <GitHub repo name>
  ephemeral-github-runner:runnersCount: "1"
  
```

It isn't mandatory to put the  config file in the root directory. Example: 'dir1/dir2/config.yaml.' 


## Inputs

Everything below except Github access token is required. There are no default values provided.

- pulumi-config-path: 'A path to your Pulumi project config file' 
- pulumi-goal: 'The name of the Pulumi goal. Supported values: create, destroy'
- pulumi-stack-name: 'The name of the Pulumi stack.'
- pulumi-cloud-provider: 'The name of the Pulumi cloud provider. Supported providers: aws, gcp' 
- cloud-architecture: 'Supported architecture names: amd64 or arm64 (no support for gcp + arm64)'
- github-access-token: 'Github access token used to clone private repositories'
- pulumi-backend-url: 'The url of your Pulumi project backend'

## Usage with AWS

```yaml 

name: ephemeral-runners
on: <Event on which the action have to start>
jobs:
    manage-runners:
        runs-on: ubuntu-latest
        steps:
          - uses: LorenzoDrudi/ephemeral-github-runner-action@<version to use>
            env:
              PULUMI_BACKEND_URL: ${{ secrets.PULUMI_BACKEND_URL }}
              APP_ID: ${{ secrets.APP_ID }}
              APP_PRIVATE_KEY: ${{ secrets.APP_PRIVATE_KEY }}
              PULUMI_CONFIG_PASSPHRASE: ${{ secrets.PULUMI_CONFIG_PASSPHRASE }}
              PULUMI_SKIP_UPDATE_CHECK: "true"
              PULUMI_SKIP_CONFIRMATIONS: "true"
              CI: "false"
              AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
              AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              AWS_REGION: ${{ secrets.AWS_REGION }}
            with:
              pulumi-config-path: <Path to the config file. e.g. dir1/dir2/config.yaml>
              pulumi-goal:  <Pulumi goal. Supported: create, destroy>
              pulumi-stack-name: <Stack name>
              pulumi-cloud-provider: 'aws'
              cloud-architecture:  <Architecture to use. Supported: amd64, arm64>
              github-access-token: ${{ secrets.ACCESS_TOKEN }}
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
```

All the personal inputs are passed by github secret.
[See the docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## Usage with GCP

```yaml 

name: ephemeral-runners
on: <Event on which the action have to start>
jobs:
    manage-runners:
        runs-on: ubuntu-latest
        steps:
          - uses: LorenzoDrudi/ephemeral-github-runner-action@<version to use>
            env:
              PULUMI_BACKEND_URL: ${{ secrets.PULUMI_BACKEND_URL }}
              APP_ID: ${{ secrets.APP_ID }}
              APP_PRIVATE_KEY: ${{ secrets.APP_PRIVATE_KEY }}
              PULUMI_CONFIG_PASSPHRASE: ${{ secrets.PULUMI_CONFIG_PASSPHRASE }}
              PULUMI_SKIP_UPDATE_CHECK: "true"
              PULUMI_SKIP_CONFIRMATIONS: "true"
              CI: "false"
              GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
              GOOGLE_PROJECT: ${{ secrets.GOOGLE_PROJECT }}
              GOOGLE_REGION: ${{ secrets.GOOGLE_REGION }}
              GOOGLE_ZONE: ${{ secrets.GOOGLE_ZONE }}
            with:
              pulumi-config-path: <Path to the config file. e.g. dir1/dir2/config.yaml>
              pulumi-goal:  <Pulumi goal. Supported: create, destroy>
              pulumi-stack-name: <Stack name>
              pulumi-cloud-provider: 'gcp'
              cloud-architecture:  'amd64' #It's the only arch supported with gcp cloud provider.
              github-access-token: ${{ secrets.ACCESS_TOKEN }}
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
```

All the personal inputs are passed by github secret.
[See the docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## Important

The workflow will fail if the cloud architecture == arm64 and the pulumi cloud provider == GCP.

## References

Generated from: [JavaScript-Action](https://github.com/actions/javascript-action)

To learn how to create a simple action, start here: [Hello-World-JavaScript-Action](https://github.com/actions/hello-world-javascript-action)

Recommended documentation: [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
