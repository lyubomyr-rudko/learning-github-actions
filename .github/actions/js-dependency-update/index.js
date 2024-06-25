const core = require("@actions/core");
const exec = require("@actions/exec");
const actions = require("@actions/github");

// Branch names should contain only letters, digits, underscores, hyphens, dots, and forward slashes.
const validateBranch = (branch) => {
  if (!/^[a-zA-Z0-9_\-./]+$/.test(branch)) {
    throw new Error(`Invalid branch name: ${branch}`);
  }
};

// Directory paths should contain only letters, digits, underscores, hyphens, and forward slashes.
const validateDirectory = (directory) => {
  if (!/^[a-zA-Z0-9_\-/]+$/.test(directory)) {
    throw new Error(`Invalid directory path: ${directory}`);
  }
};

async function run() {
  try {
    const baseBranch = core.getBooleanInput("base-branch");
    const targetBranch = core.getBooleanInput("target-branch");
    const workingDirectory = core.getBooleanInput("working-directory");
    const ghToken = core.getBooleanInput("gh-token");
    const debug = core.getBooleanInput("debug");

    validateBranch(baseBranch);
    validateBranch(targetBranch);
    validateDirectory(workingDirectory);

    // The value of the base branch
    // The value of the target branch
    // The value of the working directory
    console.log("Base branch: ", baseBranch);
    console.log("Target branch: ", targetBranch);
    console.log("Working directory: ", workingDirectory);

    await exec.exec("npm", ["update"], {
      cwd: workingDirectory,
    });

    const { stdout } = await exec.getExecOutput(
      "git",
      ["status -s package*.json"],
      {
        cwd: workingDirectory,
      }
    );

    console.log("Stdout: ", stdout);

    if (stdout) {
      console.log("Changes detected in package.json files");
    }

    console.log("Updating dependencies...");
    core.setOutput("Updated dependencies");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
