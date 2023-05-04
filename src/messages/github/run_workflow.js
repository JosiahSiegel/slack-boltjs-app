const defaultBranch = require("./utils/default_branch");
const request = require("./utils/request");

const run_workflow = async ({ args, api, say }) => {
  try {
    let msg = "";
    const workflowFile = args[2].trim();
    const arg1Value = args[3].trim();
    const app = args[4] || process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const branch =
      args[5] || (await defaultBranch({ api, app, token, say, msg }));

    const path = `/repos/${app}/actions/workflows/${workflowFile}/dispatches`;
    const method = "POST";
    const inputs = {
      env_name: `${arg1Value}`,
    };
    const data = JSON.stringify({
      ref: branch, // The reference of the branch to run the workflow from
      inputs: inputs, // The inputs for the workflow_dispatch event
    });
    msg = `Triggered workflow \`${workflowFile}\` with \`${data}\` for \`${app}\`! :rocket:`;
    const out = await request({ api, path, method, token, data, say, msg });
    if (out) {
      const json = JSON.parse(out);
      say(json.message);
    }
  } catch (error) {
    await say(`failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = run_workflow;
