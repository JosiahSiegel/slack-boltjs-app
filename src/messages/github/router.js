const pushMessage = require("./push");
const listTargetsMessage = require("./list_targets");
const runWorkflow = require("./run_workflow");

const router = async ({ message, say }) => {
  let args = message.text.split(" ");

  const inputsIndex = args.indexOf("--inputs");
  let inputs;
  if (inputsIndex > -1) {
    inputs = message.text.split("--inputs")[1].trim();
    args = message.text.split("--inputs")[0].trim().split(" ");
  }

  const ghCommand = args[1].split("-")[1];
  const api = process.env.GITHUB_API || "api.github.com";

  try {
    switch (ghCommand) {
      case "deploy":
        const force = true;
        await pushMessage({ args, api, say, force });
        break;
      case "targets":
        await listTargetsMessage({ say });
        break;
      case "run":
        await runWorkflow({ args, api, say, inputs });
        break;
      default:
        await say(`Invalid command :(: ${ghCommand}`);
    }
  } catch (error) {
    await say(`gh ${ghCommand} failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = router;
