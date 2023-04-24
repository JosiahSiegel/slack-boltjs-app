const { App } = require("@slack/bolt");
const push = require("./commands/github/push");
const appHome = require("./views/app_home");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Listen for a slash command invocation
app.command("/deploy", async ({ command, ack, respond, say }) => {
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
