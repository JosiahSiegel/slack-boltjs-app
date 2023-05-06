import defaultBranch from "../../utils/github/default_branch.js";
import request from "../../utils/github/request.js";

const run_workflow = async ({ args, api, say, inputs }) => {
  let msg = "";
  const workflowFile = args[2].trim();
  const app = args[3] || process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch =
    args[4] || (await defaultBranch({ api, app, token, say, msg }));
  let data = `{"ref":"${branch}"}`;

  if (inputs) {
    const jsonInputs = `{${inputs}}`;

    const regex1 = /([,\{] *)(\w+):/g;
    const regex2 =
      /([,\{] *"\w+":)(?! *-?[0-9\.]+[,\}])(?! *[\{\[])( *)([^,\}]*)/g;
    let correctJsonInputs = jsonInputs
      .replace(regex1, '$1"$2":')
      .replace(regex2, '$1$2"$3"');
    JSON.parse(correctJsonInputs);
    data = `{"ref":"${branch}","inputs":${correctJsonInputs}}`;
  }

  const path = `/repos/${app}/actions/workflows/${workflowFile}/dispatches`;
  const method = "POST";

  const out = await request({ api, path, method, token, data, say, msg: "" });
  if (out) {
    const json = JSON.parse(out);
    say(json.message);
  } else {
    say(
      `Triggered workflow \`${workflowFile}\` with \`${data}\` for \`${app}\`! :rocket:`
    );
  }
};

export default run_workflow;
