const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const wait = require('./wait');
const providers = require('./providers');
const architectures = require('./architectures');
const pulumiGoals = require('./pulumiGoals');
const configuration = require('./configuration');

async function run() {
  // Get all the inputs needed and construct a dictionary containing them.
  let config = await configuration.setConfig();

  console.log(`Path: ${config.configFilePath} ${config.pulumiGoal} ${config.stackName} ${config.cloudProvider} ${config.cloudArch}`);

  // Simple check on provider, arch and goal.
  // There's no support for arm64 machine on gcp.
  core.info("Checking the inputs...");
  if (!Object.values(providers).includes(config.cloudProvider.toLowerCase())) {
    core.setFailed("Wrong provider");
  } else if (!Object.values(architectures).includes(config.cloudArch.toLowerCase())) {
    core.setFailed("Wrong arch");
  } else if (config.cloudProvider.toLowerCase() == providers.Gcp && config.cloudArch.toLowerCase() == architectures.Arm64) {
    core.setFailed("Don't support gcp arm64 machines");
  } else if (!Object.values(pulumiGoals.pulumiGoals).includes(config.pulumiGoal.toLowerCase())) {
    core.setFailed("Wrong goal");
  }
  core.info("Check passed!");

  // Clone the runners repo and install the dependencies
  core.info("Cloning the repo and installing the dependencies...");
  const runnerRepoUrl = "https://github.com/pavlovic-ivan/ephemeral-github-runner.git";
  await exec.exec('git', ['clone', `${runnerRepoUrl}`]);
  await exec.exec('npm', ['ci'],  { cwd: config.runnerRepoPath });

  // Clone the repository which need the runners and obtain the path to the config.yaml file.
  // If the repository is private we need an access token to be able to clone it.
  const userRepoUrl = await buildUserRepoUrl(config);
  await exec.exec('git', ['clone', `${userRepoUrl}`]);

  // Export the env variable we need in our environment
  core.info("Setting up env variables...");
  switch (config.cloudProvider.toLowerCase()) {
    case providers.Aws:
      {
        process.env.AWS_ACCESS_KEY_ID = config.awsAccessKey;
        process.env.AWS_SECRET_ACCESS_KEY = config.awsSecretAccessKey;
        process.env.AWS_REGION = config.awsRegion;
      }
      break;
    case providers.Gcp:
      {
        process.env.GOOGLE_CREDENTIALS = config.googleCredentials;
        process.env.GOOGLE_PROJECT = config.googleProject;
        process.env.GOOGLE_REGION = config.googleRegion;
        process.env.GOOGLE_ZONE = config.googleZone;
      }
      break;
  }
  process.env.PULUMI_BACKEND_URL = config.pulumiBackendUrl;
  process.env.APP_ID = config.githubAppID;
  process.env.APP_PRIVATE_KEY = config.githubAppPrivateKey;
  process.env.PULUMI_CONFIG_PASSPHRASE = config.pulumiConfigPassphrase;
  // Skip the update check 
  process.env.PULUMI_SKIP_UPDATE_CHECK = "true";
  // Skip the pulumi confirmations
  process.env.PULUMI_SKIP_CONFIRMATIONS = "true";
  // Set CI to false to disable non-interactive mode. 
  process.env.CI = "false";

  // Print all the environment variables for testing.
  await exec.exec('printenv');

  // Execution flow for testing
  core.info("Deploying the runners...");
  await exec.exec('pulumi', ['login', `${config.pulumiBackendUrl}`], { cwd: config.runnerRepoPath });
  await exec.exec('pulumi', ['stack', 'init', `${config.stackName}`, '--secrets-provider=passphrase'], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'select', `${config.configstackName}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'ls'], { cwd: config.providerPath });
  await exec.exec('pulumi', ['update', '--diff', '--config-file', `${config.configFilePath}`], { cwd: config.providerPath });
  core.info("Runners deployed!");

  core.info("Waiting some time");
  await wait(1000);  

  core.info("Destroying the runners");
  await exec.exec('pulumi', ['stack', 'select', `${config.stackName}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['destroy', '--config-file', `${config.configFilePath}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'rm', `${config.stackName}`], { cwd: config.providerPath });
  core.info("Job finished");

  // switch (config.pulumiGoal.toLowerCase()) {
  //   case pulumiGoals.Create:
  //     await pulumiGoals.deployRunners(config);
  //     break;
  //   case providers.Gcp:
  //     await pulumiGoals.destroyRunners(config);
  //     break;
  //   default:
  //     break;
  // }
}

async function buildUserRepoUrl(config) {
  // If the repository is private we need an access token to be able to clone it.
  let urlPrefix = "https://";
  if (config.githubToken !== '') {
    urlPrefix += config.githubToken + "@";
  } 
  urlPrefix += "github.com/";
  return urlPrefix
    + github.context.payload.repository.owner.login + "/"
    + github.context.payload.repository.name;
}

run();

