const pushMessage = require("./push");
const listTargetsMessage = require("./list_targets");
const runWorkflow = require("./run_workflow");

const router = async ({ message, say }) => {
  try {
    const args = message.text.split(" ");
    const ghCommand = args[1].split("-")[1];
    const api = process.env.GITHUB_API || "api.github.com";

    switch (ghCommand) {
      case "deploy":
        const force = true;
        await pushMessage({ args, api, say, force });
        break;
      case "targets":
        await listTargetsMessage({ say });
        break;
      case "run":
        await runWorkflow({ args, api, say });
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
