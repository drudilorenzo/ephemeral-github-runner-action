require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 346:
/***/ ((module) => {

let wait = function (milliseconds) {
  return new Promise((resolve) => {
    if (typeof milliseconds !== 'number') {
      throw new Error('milliseconds not a number');
    }
    setTimeout(() => resolve("done!"), milliseconds)
  });
};

module.exports = wait;


/***/ }),

/***/ 821:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 901:
/***/ ((module) => {

module.exports = eval("require")("shelljs");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(821); 
const shell = __nccwpck_require__(901);
const wait = __nccwpck_require__(346);

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

  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);

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
  shell.exec(`git clone https://github.com/pavlovic-ivan/ephemeral-github-runner.git`);
  shell.cd(`ephemeral-github-runner`);
  shell.exec(`npm ci`);

  // Export the env variable we need in our environment
  core.info("Setting up env variables...");
  shell.env["APP_ID"]=appID;
  shell.env["APP_PRIVATE_KEY"]=appPrivateKey;
  shell.env["PULUMI_BACKEND_URL"]=pulumiBackendUrl;
  shell.env["PULUMI_CONFIG_PASSPHRASE"]=pulumiConfigPassphrase;
  shell.env["AWS_ACCESS_KEY_ID"]=awsAccessKey;
  shell.env["AWS_SECRET_ACCESS_KEY"]=awsSecretAccessKey;
  shell.env["AWS_REGION"]=awsRegion;
  // Skip the update check 
  shell.env["PULUMI_SKIP_UPDATE_CHECK"]="true";
  shell.env["PULUMI_SKIP_CONFIRMATIONS"]="true";
  shell.env["PULUMI_CREDENTIALS_PATH"]="/home/runner/.pulumi";

  // shell.env["PULUMI_ACCESS_TOKEN"]=pulumiAccessToken;

  shell.exec(`printenv`);
  shell.exec(`pulumi login ${pulumiBackendUrl}`);
  core.info("Deploying the runners...");
  shell.cd(`${cloudProvider}`);
  shell.exec(`pulumi stack init ${stackName} --secrets-provider=passphrase`);
  shell.exec(`pulumi stack select ${stackName}`);
  shell.exec(`pulumi stack ls`);
  shell.exec(`pulumi update --diff --config-file ${configPath}`);
  core.info("Runners deployed!");

  core.info("Waiting some time");
  wait(1000);  

  core.info("Destroying the runners");
  shell.exec(`pulumi stack select ${stackName}`);
  shell.exec(`pulumi destroy --config-file ${configPath}`);
  shell.exec(`pulumi stack rm ${stackName}`);
  core.info("Job finished");
}

run();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map