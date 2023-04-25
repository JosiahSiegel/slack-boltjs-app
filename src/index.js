const { App, directMention } = require("@slack/bolt");

// Commands
const push = require("./commands/github/push");
const listTargets = require("./commands/github/list_targets");

// Messages
const pushMessage = require("./messages/github/push");
const listTargetsMessage = require("./messages/github/list_targets");

// Events
const appHome = require("./views/app_home");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Listener middleware that filters out messages with 'bot_message' subtype
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== "bot_message") {
    await next();
  }
}

// Listen for direct messages
app.message(directMention(), ":wave:", async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});

app.message(directMention(), "gh-targets", async ({ say }) => {
  listTargetsMessage({ say });
});

app.message(directMention(), "gh-deploy", async ({ message, say }) => {
  const force = true;
  await pushMessage({ message, say, force });
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
