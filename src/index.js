const { App } = require("@slack/bolt");
const push = require("./commands/github/push");
const listTargets = require("./commands/github/list_targets");
const appHome = require("./views/app_home");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// This will match any message that contains 👋
app.message(':wave:', async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});

// Listen for a slash command invocation
app.command("/gh-deploy-targets", async ({ ack, respond }) => {
  await ack();
  listTargets({ respond });
});

app.command("/gh-deploy", async ({ command, ack, respond, say }) => {
  await ack();
  const force = true;
  await push({ command, respond, say, force });
});

// Listen for users opening App Home
app.event("app_home_opened", async ({ event, client, context }) => {
  appHome({ event, client, context });
});

(async () => {
  const port = 3000;

  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
