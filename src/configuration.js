const core = require('@actions/core');
const github = require('@actions/github');

let config;

function createConfig() {
    const REPO_NAME = github.context.payload.repository.name;
    const WORKING_DIR = process.env.GITHUB_WORKSPACE;
    
    // Switch values to upper case to prevent wrong inputs
    return {
        configFilePath: `${WORKING_DIR}/${REPO_NAME}/${core.getInput('pulumi-config-path')}`,
        runnerRepoPath: `${WORKING_DIR}/ephemeral-github-runner`,
        pulumiGoal: core.getInput('pulumi-goal').toUpperCase(),
        stackName: core.getInput('pulumi-stack-name'),
        cloudProvider: core.getInput('pulumi-cloud-provider').toUpperCase(),
        cloudArch: core.getInput('cloud-architecture').toUpperCase(),
        providerPath: `${WORKING_DIR}/ephemeral-github-runner/${core.getInput('pulumi-cloud-provider').toLowerCase()}`
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
