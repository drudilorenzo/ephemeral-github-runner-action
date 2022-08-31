const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const { providers } = require('./providers');
const { architectures } = require('./architectures');
const pulumiGoals = require('./pulumiGoals');
const configuration = require('./configuration');

async function run() {
    try {
        // Get all the inputs needed and construct a dictionary containing them.
        const CONFIG = configuration.getConfig();

        // Simple check on provider, arch and goal.
        // There's no support for arm64 machine on gcp.
        core.info("Checking the inputs...");
        if (!Object.values(providers).includes(CONFIG.cloudProvider)) {
            throw new Error(`Wrong provider. Supported: ${Object.values(providers)}`);
        } else if (!Object.values(architectures).includes(CONFIG.cloudArch)) {
            throw new Error(`Wrong arch. Supported: ${Object.values(architectures)}`);
        } else if (CONFIG.cloudProvider == providers.GCP && CONFIG.cloudArch == architectures.ARM64) {
            throw new Error("Don't support gcp arm64 machines");
        } else if (!Object.values(pulumiGoals.pulumiGoals).includes(CONFIG.pulumiGoal)) {
            throw new Error(`Wrong goal. Supported: ${Object.values(pulumiGoals.pulumiGoals)}`);
        }
        core.info("Check passed!");

        //Skip pulumi update check and confirmations.
        process.env.PULUMI_SKIP_UPDATE_CHECK = true;
        process.env.PULUMI_SKIP_CONFIRMATIONS = true;

        // Clone the runners repo and install the dependencies
        core.info("Cloning the repo and installing the dependencies...");
        const RUNNER_REPO_URL = "https://github.com/pavlovic-ivan/ephemeral-github-runner.git";
        await exec.exec('git', ['clone', `${RUNNER_REPO_URL}`]);
        await exec.exec('npm', ['ci', '--loglevel=error'],  { cwd: CONFIG.runnerRepoPath });

        // Clone the repository which need the runners and compute the path to the config.yaml file.
        const USER_REPO_URL = buildUserRepoUrl(CONFIG);
        await exec.exec('git', ['clone', `${USER_REPO_URL}`]);

        switch (CONFIG.pulumiGoal) {
          case pulumiGoals.pulumiGoals.CREATE:
            await pulumiGoals.deployRunners(CONFIG);
            break;
          case pulumiGoals.pulumiGoals.DESTROY:
            await pulumiGoals.destroyRunners(CONFIG);
            break;
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

function buildUserRepoUrl() {
    return `https://github.com/${github.context.payload.repository.owner.login}/${github.context.payload.repository.name}`;
}

run();

