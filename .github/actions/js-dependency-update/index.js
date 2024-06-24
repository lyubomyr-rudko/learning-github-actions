const core = require("@actions/core");

async function run() {
  console.log("Updating dependencies...");
  core.setOutput("Updated dependencies");
}

run();
