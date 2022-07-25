const core = require('@actions/core');
const github = require('@actions/github');
const providers = require('./providers');

// Return a dictionary with all the config values.
async function setConfig() {
    const userRepoName = github.context.payload.repository.name;
    const homeDirectory = "/home/runner/work/"
      + userRepoName + "/"
      + userRepoName;

    const config = {
      "configFilePath": homeDirectory + "/"
                    + userRepoName + "/" 
                    + core.getInput('pulumi-config-path'),
      "runnerRepoPath": homeDirectory + "/ephemeral-github-runner",
      "pulumiGoal": core.getInput('pulumi-goal'),
      "stackName": core.getInput('pulumi-stack-name'),
      "cloudProvider": core.getInput('pulumi-cloud-provider'),
      "pulumiBackendUrl": core.getInput('pulumi-backend-url'),
      "cloudArch": core.getInput('cloud-architecture'),
      "githubAppID": core.getInput('github-app-id'),
      "githubAppPrivateKey": core.getInput('github-app-private-key'),
      "githubAccessToken": core.getInput('github-access-token'),
      "pulumiConfigPassphrase": core.getInput('pulumi-config-passphrase'),
      "providerPath": homeDirectory + "/ephemeral-github-runner" + "/" 
        + core.getInput('pulumi-cloud-provider')
    };

    switch (config.cloudProvider.toLowerCase()) {
      case providers.Aws:
        {
          config["awsAccessKey"] = core.getInput('aws-access-key-id');
          config["awsSecretAccessKey"] = core.getInput('aws-secret-access-key');
          config["awsRegion"] = core.getInput('aws-region');
        }
        break;
      case providers.Gcp:
        {
          config["googleCredentials"] = core.getInput('google-credentials');
          config["googleProject"] = core.getInput('google-project');
          config["googleRegion"] = core.getInput('google-region');
          config["googleZone"] = core.getInput('google-zone');
        }
        break;
    }
    return config;
  }

  module.exports = { setConfig };