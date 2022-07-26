# JavaScript Github Action to deploy and destroy self-hosted runners

## Prerequisites

Before starting make sure: 
- you have access to an AWS or GCP project
- you have an account set up in either AWS or GCP.


## How to use with AWS

Create a file called config.yaml in the project root with following content:
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

## Usage

```yaml 

name: ephemeral-runners
on: workflow_dispatch
jobs:
    manage-runners:
        runs-on: ubuntu-latest
        steps:
          - uses: LorenzoDrudi/ephemeral-github-runner-action@refactoring
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
              pulumi-config-path: 'config.yaml'
              pulumi-goal: 'create'
              pulumi-stack-name: 'dev6'
              pulumi-cloud-provider: 'aws'
              cloud-architecture: 'arm64'
              github-access-token: ${{ secrets.ACCESS_TOKEN }}
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
```
## Important

The workflow will fail if the cloud architecture == arm64 and the pulumi cloud provider == GCP.

## References

Generated from: [JavaScript-Action](https://github.com/actions/javascript-action)

To learn how to create a simple action, start here: [Hello-World-JavaScript-Action](https://github.com/actions/hello-world-javascript-action)

Recommended documentation: [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
