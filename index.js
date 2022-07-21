const core = require('@actions/core'); 
const wait = require('./wait');
const exec = require('@actions/exec');

async function run() {
  // Get all the inputs needed
  const configPath = core.getInput('pulumi-config-path');
  const pulumiGoal = core.getInput('pulumi-goal');
  const stackName = core.getInput('pulumi-stack-name');
  const cloudProvider = core.getInput('pulumi-cloud-provider');
  const pulumiBackendUrl = core.getInput('pulumi-backend-url');
  const cloudArch = core.getInput('cloud-architecture');
  const appID=core.getInput('app-id'); 
  const appPrivateKey = core.getInput('app-private-key');
  const pulumiConfigPassphrase = core.getInput('pulumi-config-passphrase');
  const awsAccessKey = core.getInput('aws-access-key');
  const awsSecretAccessKey = core.getInput('aws-secret-access-key');
  const awsRegion = core.getInput('aws-region');
  // const pulumiAccessToken = core.getInput('pulumi-access-token');

  console.log(`Path: ${configPath} ${pulumiGoal} ${stackName} ${cloudProvider} ${cloudArch}`);

  // Simple check on provider and arch, we don't support gcp with an arm64 arch
  // TODO: use enumerated values
  core.info("Checking the inputs...");
  if (!(cloudProvider.toLowerCase() == 'aws' || cloudProvider.toLowerCase() == 'gcp')) {
    core.setFailed("Wrong provider");
  } else if (!(cloudArch.toLowerCase() == 'arm64' || cloudArch.toLowerCase() == 'amd64')) {
    core.setFailed("Wrong arch");
  } else if (cloudProvider.toLowerCase() == 'gcp' && cloudArch.toLowerCase() == 'arm64') {
    core.setFailed("GCP doesn't have arm machines");
  }
  core.info("Check passed!");

  // Clone the repo and install the dependencies
  core.info("Cloning the repo and installing the dependencies...");
  const runnersRepoUrl = "https://github.com/pavlovic-ivan/ephemeral-github-runner.git";
  await exec.exec('git', ['clone', `${runnersRepoUrl}`]);
  const repoName = "ephemeral-github-runner";
  await exec.exec(`cd ${repoName}`);
  await exec.exec('npm', ['ci']);

  // Export the env variable we need in our environment
  core.info("Setting up env variables...");
  process.env.APP_ID=appID;
  process.env.PULUMI_BACKEND_URL=pulumiBackendUrl;
  process.env.APP_PRIVATE_KEY=appPrivateKey;
  process.env.PULUMI_CONFIG_PASSPHRASE=pulumiConfigPassphrase;
  process.env.AWS_ACCESS_KEY_ID=awsAccessKey;
  process.env.AWS_SECRET_ACCESS_KEY=awsSecretAccessKey;
  process.env.AWS_REGION=awsRegion;
  // Skip the update check 
  process.env.PULUMI_SKIP_UPDATE_CHECK="true";
  process.env.PULUMI_SKIP_CONFIRMATIONS="true";
  process.env.PULUMI_CREDENTIALS_PATH="/home/runner/.pulumi";

  // shell.env["PULUMI_ACCESS_TOKEN"]=pulumiAccessToken;

  await exec.exec('printenv');
  await exec.exec('pulumi', ['login', `${pulumiBackendUrl}`]);
  core.info("Deploying the runners...");
  await exec.exec('cd', [`${cloudProvider}`]);
  await process.exec('pulumi', ['stack init', `${stackName}`, '--secrets-provider=passphrase']);
  await process.exec('pulumi', ['stack select', `${stackName}`]);
  await process.exec('pulumi', ['stack ls']);
  await process.exec('pulumi', ['update', '--diff', '--config-file', `${configPath}`]);
  core.info("Runners deployed!");

  core.info("Waiting some time");
  await wait(1000);  

  core.info("Destroying the runners");
  await process.exec('pulumi', ['stack select', `${stackName}`]);
  await process.exec('pulumi', ['destroy', '--config-file', `${configPath}`]);
  await process.exec('pulumi', ['stack rm', `${stackName}`]);
  core.info("Job finished");
}

run();
