const core = require('@actions/core'); 
const exec = require('@actions/exec');

const pulumiGoals = {
    CREATE: "create",
    DESTROY: "destroy"
};

async function deployRunners(CONFIG) {
    core.info("Deploying the runners...");
    await exec.exec('pulumi', ['login', `${CONFIG.pulumiBackendUrl}`], { cwd: CONFIG.runnerRepoPath });
    await exec.exec('pulumi', ['stack', 'init', `${CONFIG.stackName}`, '--secrets-provider=passphrase'], { cwd: CONFIG.providerPath });
    await exec.exec('pulumi', ['stack', 'select', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
    await exec.exec('pulumi', ['update', '--diff', '--config-file', `${CONFIG.configFilePath}`], { cwd: CONFIG.providerPath });
    core.info("Runners deployed!");
}
  
async function destroyRunners(CONFIG) {
    core.info("Destroying the runners");
    await exec.exec('pulumi', ['login', `${CONFIG.pulumiBackendUrl}`], { cwd: CONFIG.runnerRepoPath });
    await exec.exec('pulumi', ['stack', 'select', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
    await exec.exec('pulumi', ['destroy', '--config-file', `${CONFIG.configFilePath}`], { cwd: CONFIG.providerPath });
    await exec.exec('pulumi', ['stack', 'rm', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
    core.info("Job finished");
}

module.exports = {
    pulumiGoals, 
    deployRunners,
    destroyRunners
};