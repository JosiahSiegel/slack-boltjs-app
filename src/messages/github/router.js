const pushMessage = require("./push");
const listTargetsMessage = require("./list_targets");

const router = async ({ message, say }) => {
  try {
    const data = message.text.split(" ");
    const ghCommand = data[1].split("-")[1];

    switch (ghCommand) {
      case "deploy":
        const force = true;
        await pushMessage({ message, say, force });
        break;
      case "targets":
        await listTargetsMessage({ say });
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
