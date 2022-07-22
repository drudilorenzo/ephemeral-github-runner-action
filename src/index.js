const core = require('@actions/core'); 
const exec = require('@actions/exec');

const wait = require('./wait');

const providers = require('./providers');
const architectures = require('./architectures');
const pulumiGoals = require('./pulumiGoals');
// const deployRunners = require('./src/deployRunners');
// const destroyRunners = require('./src/destroyRunners');

async function run() {
  // Get all the inputs needed and construct a dictionary containing them.
  let config = {}
  config["configPath"] = core.getInput('pulumi-config-path');
  config["pulumiGoal"] = core.getInput('pulumi-goal');
  config["stackName"] = core.getInput('pulumi-stack-name');
  config["cloudProvider"] = core.getInput('pulumi-cloud-provider');
  config["pulumiBackendUrl"] = core.getInput('pulumi-backend-url');
  config["cloudArch"] = core.getInput('cloud-architecture');
  config["appID"] = core.getInput('github-app-id'); 
  config["appPrivateKey"] = core.getInput('github-app-private-key');
  config["pulumiConfigPassphrase"] = core.getInput('pulumi-config-passphrase');

  console.log(`Path: ${config.configPath} ${config.pulumiGoal} ${config.stackName} 
      ${config.cloudProvider} ${config.cloudArch}`);

  // Simple check on provider, arch and goal.
  // There's no support for arm64 machine on gcp.
  core.info("Checking the inputs...");
  if (!Object.values(providers).includes(config.cloudProvider.toLowerCase())) {
    core.setFailed("Wrong provider");
  } else if (!Object.values(architectures).includes(config.cloudArch.toLowerCase())) {
    core.setFailed("Wrong arch");
  } else if (config.cloudProvider.toLowerCase() == providers.Gcp && config.cloudArch.toLowerCase() == architectures.Arm64) {
    core.setFailed("Don't support gcp arm64 machines");
  } else if (!Object.values(pulumiGoals).includes(config.pulumiGoal.toLowerCase())) {
    core.info(config.pulumiGoal)
    core.info(pulumiGoals.toString())
    core.setFailed("Wrong goal");
  }
  core.info("Check passed!");

  // Clone the repo and install the dependencies
  core.info("Cloning the repo and installing the dependencies...");
  const runnersRepoUrl = "https://github.com/pavlovic-ivan/ephemeral-github-runner.git";
  await exec.exec('git', ['clone', `${runnersRepoUrl}`]);
  config["repoPath"] = "ephemeral-github-runner";
  await exec.exec('npm', ['ci'],  { cwd: config.repoPath });

  // Export the env variable we need in our environment
  core.info("Setting up env variables...");
  switch (config.cloudProvider.toLowerCase()) {
    case providers.Aws:
      {
        const awsAccessKey = core.getInput('aws-access-key-id');
        const awsSecretAccessKey = core.getInput('aws-secret-access-key');
        const awsRegion = core.getInput('aws-region');
        process.env.AWS_ACCESS_KEY_ID=awsAccessKey;
        process.env.AWS_SECRET_ACCESS_KEY=awsSecretAccessKey;
        process.env.AWS_REGION=awsRegion;
      }
      break;
    case providers.Gcp:
      {
        const googleCredentials = core.getInput('google-credentials');
        const googleProject = core.getInput('google-project');
        const googleRegion = core.getInput('google-region');
        const googleZone = core.getInput('google-zone');
        process.env.GOOGLE_CREDENTIALS=googleCredentials;
        process.env.GOOGLE_PROJECT=googleProject;
        process.env.GOOGLE_REGION=googleRegion;
        process.env.GOOGLE_ZONE=googleZone;
      }
      break;
    default:
      break;
  }
  process.env.APP_ID = config.appID;
  process.env.PULUMI_BACKEND_URL = config.pulumiBackendUrl;
  process.env.APP_PRIVATE_KEY = config.appPrivateKey;
  process.env.PULUMI_CONFIG_PASSPHRASE = config.pulumiConfigPassphrase;
  // Skip the update check 
  process.env.PULUMI_SKIP_UPDATE_CHECK = "true";
  // Skip the pulumi confirmations
  process.env.PULUMI_SKIP_CONFIRMATIONS = "true";
  // Set CI to false to disable non-interactive mode. 
  process.env.CI = "false";

  await exec.exec('printenv');

  core.info("Deploying the runners...");
  await exec.exec('pulumi', ['login', `${config.pulumiBackendUrl}`], { cwd: config.repoPath });
  config["providerPath"] = config.repoPath + "/"+ config.cloudProvider;
  await exec.exec('pulumi', ['stack', 'init', `${config.stackName}`, '--secrets-provider=passphrase'], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'select', `${config.configstackName}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'ls'], { cwd: config.providerPath });
  await exec.exec('pulumi', ['update', '--diff', '--config-file', `${config.configPath}`], { cwd: config.providerPath });
  core.info("Runners deployed!");

  core.info("Waiting some time");
  await wait(1000);  

  core.info("Destroying the runners");
  await exec.exec('pulumi', ['stack', 'select', `${config.stackName}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['destroy', '--config-file', `${config.configPath}`], { cwd: config.providerPath });
  await exec.exec('pulumi', ['stack', 'rm', `${config.stackName}`], { cwd: config.providerPath });
  core.info("Job finished");

  // switch (config.pulumiGoal.toLowerCase()) {
  //   case pulumiGoals.Create:
  //     await deployRunners(config);
  //     break;
  //   case providers.Gcp:
  //     await destroyRunners(config);
  //     break;
  //   default:
  //     break;
  // }
}

run();
