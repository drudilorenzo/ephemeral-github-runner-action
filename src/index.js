const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const wait = require('./wait');
const { providers } = require('./providers');
const { architectures } = require('./architectures');
const pulumiGoals = require('./pulumiGoals');
const configuration = require('./configuration');

async function run() {

try {
    // Get all the inputs needed and construct a dictionary containing them.
    const config = configuration.getConfig();

    console.log(`Path: ${config.configFilePath} ${config.pulumiGoal} ${config.stackName} ${config.cloudProvider} ${config.cloudArch}`);

    // Simple check on provider, arch and goal.
    // There's no support for arm64 machine on gcp.
    core.info("Checking the inputs...");
    if (!Object.values(providers).includes(config.cloudProvider.toLowerCase())) {
        throw new Error("Wrong provider");
    } else if (!Object.values(architectures).includes(config.cloudArch.toLowerCase())) {
        throw new Error("Wrong arch");
    } else if (config.cloudProvider.toLowerCase() == providers.GCP && config.cloudArch.toLowerCase() == architectures.ARM64) {
        throw new Error("Don't support gcp arm64 machines");
    } else if (!Object.values(pulumiGoals.pulumiGoals).includes(config.pulumiGoal.toLowerCase())) {
        throw new Error("Wrong goal");
    }
    core.info("Check passed!");

    // Clone the runners repo and install the dependencies
    core.info("Cloning the repo and installing the dependencies...");
    const runnerRepoUrl = "https://github.com/pavlovic-ivan/ephemeral-github-runner.git";
    await exec.exec('git', ['clone', `${runnerRepoUrl}`]);
    await exec.exec('npm', ['ci', '--loglevel=error'],  { cwd: config.runnerRepoPath });

    // Clone the repository which need the runners and obtain the path to the config.yaml file.
    // If the repository is private we need an access token to be able to clone it.
    const userRepoUrl = buildUserRepoUrl(config);
    await exec.exec('git', ['clone', `${userRepoUrl}`]);

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
    //   case pulumiGoals.pulumiGoals.Create:
    //     await pulumiGoals.deployRunners(config);
    //     break;
    //   case pulumiGoals.pulumiGoals.Destroy:
    //     await pulumiGoals.destroyRunners(config);
    //     break;
    // }
} catch (error) {
    core.setFailed(error.message)
}
}

function buildUserRepoUrl() {
    let urlPrefix = "https://github.com/";
    return urlPrefix
        + github.context.payload.repository.owner.login + "/"
        + github.context.payload.repository.name;
}

run();

