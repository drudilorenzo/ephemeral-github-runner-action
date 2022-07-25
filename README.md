# Javascript github action to deploy and destroy self-hosted runners

## How to use with AWS


## How to use with GCP

## Usage

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
```

## Important

The workflow will fail if the cloud architecture == arm64 and the pulumi cloud provider == GCP.

## References

Generated from: [JavaScript-Action](https://github.com/actions/javascript-action)

To learn how to create a simple action, start here: [Hello-World-JavaScript-Action](https://github.com/actions/hello-world-javascript-action)

Recommended documentation: [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
