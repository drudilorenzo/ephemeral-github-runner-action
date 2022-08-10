const core = require('@actions/core'); 
const exec = require('@actions/exec');

const pulumiGoals = {
    CREATE: "CREATE",
    DESTROY: "DESTROY"
};

async function deployRunners(CONFIG) {
    try {
        core.info("Deploying the runners...");
        await exec.exec('pulumi', ['login', process.env.PULUMI_BACKEND_URL], { cwd: CONFIG.runnerRepoPath });
        await exec.exec('pulumi', ['stack', 'init', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
        await exec.exec('pulumi', ['update', '--diff', '--config-file', `${CONFIG.configFilePath}`], 
            { cwd: CONFIG.providerPath });
        core.info("Runners deployed!");
    } catch (error) {
        core.setFailed(error.message);
    }
}
  
async function destroyRunners(CONFIG) {
    try {
        core.info("Destroying the runners");
        await exec.exec('pulumi', ['login', process.env.PULUMI_BACKEND_URL], { cwd: CONFIG.runnerRepoPath });
        await exec.exec('pulumi', ['stack', 'select', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
        await exec.exec('pulumi', ['destroy', '--config-file', `${CONFIG.configFilePath}`], 
            { cwd: CONFIG.providerPath });
        await exec.exec('pulumi', ['stack', 'rm', `${CONFIG.stackName}`], { cwd: CONFIG.providerPath });
        core.info("Job finished");
    } catch (error) {
        core.setFailed(error.message);
    }
}

module.exports = {
    pulumiGoals, 
    deployRunners,
    destroyRunners
};