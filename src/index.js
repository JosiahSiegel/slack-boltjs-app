const { App } = require("@slack/bolt");
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode:true, enable to use socket mode
  // appToken: process.env.APP_TOKEN
});

const deploy = require("./commands/deploy");
const help = require("./commands/help");

const appHome = require("./views/app_home");
const buttonAbc = require("./buttons/button_abc");

// This will match any message that contains 👋
app.message(":wave:", async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});

// Listen for a slash command invocation
app.message(
  /deploy ([-_\.0-9a-zA-Z\/]+)? to ([-_\.0-9a-zA-Z\/]+)(?: for ([\-A-z0-9]+)\/([\-A-z0-9]+))?$/i,
  async ({ context, say }) => {
    say("Deploy request received!");
    say(`${context}`);
    const sourceBranch = context.match[0];
    const targetBranch = context.match[2];
    const owner = context.match[3] || process.env.GITHUB_OWNER;
    const repo = context.match[4] || process.env.GITHUB_REPO;
    deploy({ sourceBranch, targetBranch, owner, repo, say });
  }
);

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
