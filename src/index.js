const { App } = require("@slack/bolt");
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode:true, enable to use socket mode
  // appToken: process.env.APP_TOKEN
});

const appHome = require("./views/app_home");
const help = require("./commands/help");
const buttonAbc = require("./buttons/button_abc");

// Listen for users opening App Home
app.event("app_home_opened", async ({ event, client, context }) => {
  appHome({ event, client, context });
});

// Listen for a slash command invocation
app.command("/help", async ({ ack, payload, context, client }) => {
  help({ ack, payload, context, client });
});

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
// You must set up a Request URL under Interactive Components on your app configuration page
app.action("button_abc", async ({ ack, body, context, client }) => {
  // Acknowledge the button request
  buttonAbc({ ack, body, context, client });
});

(async () => {
  const port = 3000;

  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
