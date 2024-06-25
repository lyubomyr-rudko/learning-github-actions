const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

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
    const baseBranch = core.getInput("base-branch");
    const targetBranch = core.getInput("target-branch");
    const workingDirectory = core.getInput("working-directory");
    const ghToken = core.getInput("gh-token");
    const debug = core.getBooleanInput("debug");

    core.setSecret(ghToken);

    validateBranch(baseBranch);
    validateBranch(targetBranch);
    validateDirectory(workingDirectory);

    // The value of the base branch
    // The value of the target branch
    // The value of the working directory
    console.log("Base branch: ", baseBranch);
    console.log("Target branch: ", targetBranch);
    console.log("Working directory: ", workingDirectory);

    await exec.exec("npm update", [], {
      cwd: workingDirectory,
    });

    const { stdout } = await exec.getExecOutput(
      "git status -s package*.json",
      [],
      {
        cwd: workingDirectory,
      }
    );

    if (stdout.length > 0) {
      core.info("[js-dependency-update] : There are updates available!");

      try {
        await exec.exec(`git config --global user.name "gh-automation"`);
        await exec.exec(
          `git config --global user.email "gh-automation@email.com"`
        );
        await exec.exec(`git checkout -b ${targetBranch}`, [], {
          cwd: workingDir,
        });
        await exec.exec(`git add package.json package-lock.json`, [], {
          cwd: workingDir,
        });
        await exec.exec(`git commit -m "chore: update dependencies`, [], {
          cwd: workingDir,
        });
        await exec.exec(`git push -u origin ${targetBranch} --force`, [], {
          cwd: workingDir,
        });

        const oktokit = github.getOctokit(ghToken);

        await oktokit.rest.pulls.create({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          title: `Update dependencies`,
          body: `This PR updates the dependencies in the project.`,
          base: baseBranch,
          head: targetBranch,
        });
      } catch (error) {
        core.error(
          "[js-dependency-update] : Something went wrong while creating the PR. Check logs below."
        );
        core.setFailed(error.message);
        core.error(error);
      }
    } else {
      core.info("[js-dependency-update] : No updates at this point in time.");
    }

    console.log("Updating dependencies...");
    core.setOutput("Updated dependencies");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
