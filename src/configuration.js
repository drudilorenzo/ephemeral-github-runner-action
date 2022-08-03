const core = require('@actions/core');
const github = require('@actions/github');

let config;

function createConfig() {
    const USER_REPO_NAME = github.context.payload.repository.name;
    const HOME_DIRECTORY = "/home/runner/work/" + USER_REPO_NAME + "/" + USER_REPO_NAME;
    
    // Switch values to upper case to prevent wrong inputs
    return {
        configFilePath: HOME_DIRECTORY + "/" + USER_REPO_NAME + "/" 
            + core.getInput('pulumi-config-path'),
        runnerRepoPath: HOME_DIRECTORY + "/ephemeral-github-runner",
        pulumiGoal: core.getInput('pulumi-goal').toUpperCase(),
        stackName: core.getInput('pulumi-stack-name'),
        cloudProvider: core.getInput('pulumi-cloud-provider').toUpperCase(),
        cloudArch: core.getInput('cloud-architecture').toUpperCase(),
        pulumiBackendUrl: core.getInput('pulumi-backend-url'),
        providerPath: HOME_DIRECTORY + "/ephemeral-github-runner" + "/" 
            + core.getInput('pulumi-cloud-provider').toLowerCase()
    }
}

// Return a dictionary with all the config values.
function getConfig() {
  // If config is undefined, then we set it
  if (!config) {
      config = createConfig();
  }
  return config;
}

module.exports = {getConfig};