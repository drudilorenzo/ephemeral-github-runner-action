# JavaScript Github Action to deploy and destroy self-hosted runners

[![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://en.wikipedia.org/wiki/JavaScript)
[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Prerequisites

Before starting make sure:

- You have an account set up in either AWS or GCP.
- You have a [github app](https://github.com/pavlovic-ivan/ephemeral-github-runner/blob/main/QUICKSTART.md#github-app-setup) linked to the repository where the runners have to work (Same repo of the one inside config.yaml file).
- You have a ready backend on the cloud provider you want to use (<s3://bucket_name> or <gs://bucket_name>).
- You have a machine image on the cloud provider you want to use.

## AWS Configuration

Create a file called config.yaml with following content:

```yaml
config:
  ephemeral-github-runner:bootDiskSizeInGB: "100"
  ephemeral-github-runner:bootDiskType: gp2
  ephemeral-github-runner:labels: <comma-separated list of runner labels>
  ephemeral-github-runner:machineImage: <path to the AWS AMI machine image with Github runner installed>
  ephemeral-github-runner:machineType: <machine type of your choice>
  ephemeral-github-runner:owner: <GitHub org or username under which the repo is>
  ephemeral-github-runner:repo: <GitHub repo name>
  ephemeral-github-runner:runnersCount: "1"
  
 ```

 It isn't mandatory to put the  config file in the root directory. Example: 'dir1/dir2/config.yaml.'

## GCP Configuration

Create a file called config.yaml with following content:

```yaml
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

## Action's Inputs

Everything below is required. There are no default values provided.

- pulumi-config-path: A path to your Pulumi project config file
- pulumi-goal: The name of the Pulumi goal. Supported values: create, destroy
- pulumi-stack-name: The name of the Pulumi stack.
- pulumi-cloud-provider: The name of the Pulumi cloud provider. Supported providers: aws, gcp
- cloud-architecture: Supported architecture names: amd64 or arm64 (no support for gcp + arm64)

## Action's Environment Variables

- APP_ID: GitHub App ID
- APP_PRIVATE_KEY: GitHub App Private Key
- PULUMI_CONFIG_PASSPHRASE: A passphrase that will be used to encrypt secrets

AWS:

- PULUMI_BACKEND_URL: Path to the S3 bucket in format -> s3://bucket_name
- AWS_ACCESS_KEY_ID: Your access key id received when account was created
- AWS_SECRET_ACCESS_KEY: Your secret access key received when account was created
- AWS_REGION: AWS region, eg. eu-west-2

GCP:

- PULUMI_BACKEND_URL: Path to the GS bucket in format -> gs://bucket_name
- GOOGLE_CREDENTIALS:  GCP credentials
- GOOGLE_PROJECT: GCP project ID
- GOOGLE_REGION: GCP region e.g. 'europe-west4'
- GOOGLE_ZONE: GCP zone e.g. 'europe-west4-a'

## Usage example with AWS

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
              AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
              AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              AWS_REGION: ${{ secrets.AWS_REGION }}
            with:
              pulumi-config-path: <Path to the config file. e.g. dir1/dir2/config.yaml>
              pulumi-goal:  <Pulumi goal. Supported: create, destroy>
              pulumi-stack-name: <Stack name>
              pulumi-cloud-provider: 'aws'
              cloud-architecture:  <Architecture to use. Supported: amd64, arm64>
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
```

All the personal inputs are passed by github secret.
[See the docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## Usage example with GCP

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
              pulumi-backend-url: ${{ secrets.PULUMI_BACKEND_URL }}
```

All the personal inputs are passed by github secret.
[See the docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## Main projects

Main project: [ephemeral-github-runner](https://github.com/pavlovic-ivan/ephemeral-github-runner)

Images builder: [ephemeral-github-runner-image](https://github.com/pavlovic-ivan/ephemeral-github-runner-image)

## Important

The workflow will fail if the cloud architecture == arm64 and the pulumi cloud provider == GCP.

## References

Generated from: [JavaScript-Action](https://github.com/actions/javascript-action)

To learn how to create a simple action, start here: [Hello-World-JavaScript-Action](https://github.com/actions/hello-world-javascript-action)

Recommended documentation: [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
