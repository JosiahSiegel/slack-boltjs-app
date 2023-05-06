import push from "../../utils/github/push.js";
import listTargetsMessage from "./list_targets.js";
import runWorkflow from "./run_workflow.js";

// Define constants
const api = process.env.GITHUB_API || "api.github.com";
const force = true;

// Define a function to route the commands
const router = async ({ message, say }) => {
  // Split the message text by spaces
  let args = message.text.split(" ");

  // Check if there are inputs after --inputs flag
  const inputsIndex = args.indexOf("--inputs");
  let inputs;
  if (inputsIndex > -1) {
    // Get the inputs from the message text
    inputs = message.text.split("--inputs")[1].trim();
    // Remove the inputs from the args array
    args = message.text.split("--inputs")[0].trim().split(" ");
  }

  // Get the command from the second argument
  const ghCommand = args[1].split("-")[1];

  try {
    // Execute the command based on a switch statement
    switch (ghCommand) {
      case "deploy":
        await push({ args, api, respond: say, say, force, isCommand: false });
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
    // Handle errors and log them
    await say(`gh ${ghCommand} failed with error: ${error}`);
    console.error(error);
  }
};

export default router;
