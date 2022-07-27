const core = require('@actions/core');
const github = require('@actions/github');

let config = null;
let a = 0;

async function createConfig() {
    const userRepoName = github.context.payload.repository.name;
    const homeDirectory = "/home/runner/work/" + userRepoName + "/" + userRepoName;
    
    return {
        "configFilePath": homeDirectory + "/" + userRepoName + "/" + core.getInput('pulumi-config-path'),
        "runnerRepoPath": homeDirectory + "/ephemeral-github-runner",
        "pulumiGoal": core.getInput('pulumi-goal'),
        "stackName": core.getInput('pulumi-stack-name'),
        "cloudProvider": core.getInput('pulumi-cloud-provider'),
        "cloudArch": core.getInput('cloud-architecture'),
        "pulumiBackendUrl": core.getInput('pulumi-backend-url'),
        "providerPath": homeDirectory + "/ephemeral-github-runner" + "/" + core.getInput('pulumi-cloud-provider')
    }
}

// Return a dictionary with all the config values.
async function getConfig() {
  // if config is null, then we set it
  if (!config) {
      config = await createConfig();
  }
  a++;
  core.info(a)
  return config;
}

module.exports = {getConfig}