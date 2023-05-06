import defaultBranch from "../../utils/github/default_branch.js";
import request from "../../utils/github/request.js";

const run_workflow = async ({ args, api, say, inputs }) => {
  const workflowFile = args[2].trim();
  const app = args[3] || process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch =
    args[4] || (await defaultBranch({ api, app, token, say }));
  // Use an object to store the request data
  let data = { ref: branch };

  if (inputs) {
    // Use JSON.parse and JSON.stringify to convert the inputs to a valid JSON object
    const jsonInputs = `{${inputs}}`;
    const regex1 = /([,\{] *)(\w+):/g;
    const regex2 =
      /([,\{] *"\w+":)(?! *-?[0-9\.]+[,\}])(?! *[\{\[])( *)([^,\}]*)/g;
    let correctJsonInputs = jsonInputs
      .replace(regex1, '$1"$2":')
      .replace(regex2, '$1$2"$3"');
    data.inputs = JSON.parse(correctJsonInputs);
  }

  const stringData = JSON.stringify(data);
  const path = `/repos/${app}/actions/workflows/${workflowFile}/dispatches`;
  const method = "POST";

  const out = await request({ api, path, method, token, data:stringData, say });
  if (out) {
    const json = JSON.parse(out);
    say(json.message);
  } else {
    say(
      `Triggered workflow \`${workflowFile}\` with \`${stringData}\` for \`${app}\`! :rocket:`
    );
  }
};

export default run_workflow;
