const core = require('@actions/core');
const github = require('@actions/github');

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
      "cloudArch": core.getInput('cloud-architecture'),
      "githubAccessToken": core.getInput('github-access-token'),
      "pulumiBackendUrl": core.getInput('pulumi-backend-url'),
      "providerPath": homeDirectory 
        + "/ephemeral-github-runner" + "/" 
        + core.getInput('pulumi-cloud-provider')
    };
    return config;
  }

  module.exports = { setConfig };