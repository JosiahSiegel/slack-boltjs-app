const push = async ({ message, say, force }) => {
  try {
    await branchPush(message, force, say);
  } catch (error) {
    await say(`Deploy ${message.text} failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = push;

const branchPushCheckConfiguration = function (
  sourceBranch,
  targetBranch,
  app,
  token,
  say
) {
  const deployTargets = process.env.GITHUB_TARGET_BRANCHES.split(",");
  if (!token) {
    say("Missing configuration: GITHUB_TOKEN");
    return false;
  }
  if (!app) {
    say(
      "Missing configuration: [for :owner/:repo] or GITHUB_OWNER/GITHUB_REPO"
    );
    return false;
  }
  if (!sourceBranch) {
    say("Missing <sourceBranch>: deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!targetBranch) {
    say("Missing <targetBranch>: deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!process.env.GITHUB_TARGET_BRANCHES) {
    say("Missing configuration: GITHUB_TARGET_BRANCHES");
    return false;
  }
  if (!Array.from(deployTargets).includes(targetBranch)) {
    say(
      `\"${targetBranch}\" is not in available target branches. Use \`/gh-deploy-targets\``
    );
    return false;
  }

  return true;
};

const branchPush = function (command, force, say) {
  const https = require("https");
  const data = command.text.split(" ");
  const sourceBranch = data[0].trim();
  const targetBranch = data[2].trim();
  const app = process.env.GITHUB_REPO || data[4];
  const token = process.env.GITHUB_TOKEN;
  const api = process.env.GITHUB_API || "api.github.com";

  if (
    !branchPushCheckConfiguration(sourceBranch, targetBranch, app, token, say)
  ) {
    return;
  }

  const options = {
    hostname: api,
    port: 443,
    path: `/repos/${app}/git/refs/heads/${sourceBranch}`,
    method: "GET",
    headers: {
      "User-Agent": "request",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      let sha = "";
      try {
        sha = JSON.parse(data).object.sha;
      } catch (error) {
        say(`I failed to find branch \"${sourceBranch}\"!`);
        return;
      }
      const postData = JSON.stringify({
        sha,
        force: force,
      });

      const postOptions = {
        hostname: api,
        port: 443,
        path: `/repos/${app}/git/refs/heads/${targetBranch}`,
        method: "PUT",
        headers: {
          "User-Agent": "request",
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          "Content-Length": postData.length,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      };

      let pushMsg;
      if (force == true) {
        pushMsg = "Force pushed";
      } else {
        pushMsg = "Pushed";
      }

      const postReq = https.request(postOptions, (postRes) => {
        let postResData = "";

        postRes.on("data", (chunk) => {
          postResData += chunk;
        });

        postRes.on("end", () => {
          say(`${pushMsg} commit \"${sha}\" to branch \"${targetBranch}\"`);
          say(
            `\`deploy ${sourceBranch} to ${targetBranch} for ${app}\` triggered! :rocket:`
          );
        });
      });

      postReq.write(postData);
      postReq.end();
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.end();

  return true;
};
