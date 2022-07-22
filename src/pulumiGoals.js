const core = require('@actions/core'); 
const exec = require('@actions/exec');

const goals = {
    Create: "create",
    Destroy: "destroy"
}

async function deployRunners(config) {
    core.info("Deploying the runners...");
    await exec.exec('pulumi', ['login', `${config.pulumiBackendUrl}`], { cwd: config.repoPath });
    await exec.exec('pulumi', ['stack', 'init', `${config.stackName}`, '--secrets-provider=passphrase'], { cwd: config.providerPath });
    await exec.exec('pulumi', ['stack', 'select', `${config.stackName}`], { cwd: config.providerPath });
    await exec.exec('pulumi', ['stack', 'ls'], { cwd: config.providerPath });
    await exec.exec('pulumi', ['update', '--diff', '--config-file', `${config.configPath}`], { cwd: config.providerPath });
    core.info("Runners deployed!");
}
  
  async function destroyRunners(config) {
    core.info("Destroying the runners");
    await exec.exec('pulumi', ['login', `${config.pulumiBackendUrl}`], { cwd: config.repoPath });
    await exec.exec('pulumi', ['stack', 'select', `${config.stackName}`], { cwd: config.providerPath });
    await exec.exec('pulumi', ['destroy', '--config-file', `${config.configPath}`], { cwd: config.providerPath });
    await exec.exec('pulumi', ['stack', 'rm', `${config.stackName}`], { cwd: config.providerPath });
    core.info("Job finished");
}

module.exports = goals;
module.exports = deployRunners;
module.exports = destroyRunners;