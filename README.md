# JavaScript github action to deploy and destroy self-hosted runners

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
## How to use with GCP

Create a file called config.yaml in the project root with following content:

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
## Usage

```yaml
name: ephemeral-runners
on: workflow_dispatch
jobs:
    manage-runners:
        runs-on: ubuntu-latest
        steps:
          - uses: LorenzoDrudi/ephemeral-github-runner-action@refactoring
            with:
              pulumi-config-path: 'config.yaml'
              pulumi-goal: 'create'
              pulumi-stack-name: 'dev5'
              pulumi-cloud-provider: 'aws'
              pulumi-config-passphrase: ${{ secrets.PULUMI_CONFIG_PASSPHRASE }}
              cloud-architecture: 'arm64'
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
              github-app-id: ${{ secrets.APP_ID }}
              github-app-private-key: ${{ secrets.APP_PRIVATE_KEY }}
              aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
              aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              aws-region: ${{ secrets.AWS_REGION }}
              github-access-token: ${{ secrets.ACCESS_TOKEN }}
```

## Important

The workflow will fail if the cloud architecture == arm64 and the pulumi cloud provider == GCP.

## References

Generated from: [JavaScript-Action](https://github.com/actions/javascript-action)

To learn how to create a simple action, start here: [Hello-World-JavaScript-Action](https://github.com/actions/hello-world-javascript-action)

Recommended documentation: [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
