import boltjs from '@slack/bolt';
const { App, directMention } = boltjs;
import fs from "fs";
import ghRouter from "./messages/github/router.js";
import appHome from "./views/app_home.js";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Listen for direct messages
app.message(directMention(), ":wave:", async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});

app.message(directMention(), "gh-", async ({ message, say }) => {
  await ghRouter({ message, say });
});

app.message(directMention(), "help", async ({ say }) => {
  const filename = ".help";
  fs.readFile(filename, "utf8", function (err, data) {
    if (err) throw err;
    say(data);
  });
});

// Listen for users opening App Home
app.event("app_home_opened", async ({ event, client }) => {
  appHome({ event, client });
});

(async () => {
  const port = 3000;

  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
