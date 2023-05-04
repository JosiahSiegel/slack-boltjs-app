const request = require("./utils/request");

const push = async ({ args, api, say, force }) => {
  try {
    branchPush(args, api, force, say);
  } catch (error) {
    await say(`Deploy failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = push;

const branchPushCheckConfiguration = function (
  directMention,
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
      `\"${targetBranch}\" is not in available target branches. Use:  ${directMention} gh-targets`
    );
    return false;
  }

  return true;
};

const branchPush = function (args, api, force, say) {
  const https = require("https");
  const directMention = args[0].trim();
  const sourceBranch = args[2].trim();
  const targetBranch = args[4].trim();
  const app = process.env.GITHUB_REPO || args[6];
  const token = process.env.GITHUB_TOKEN;

  if (
    !branchPushCheckConfiguration(
      directMention,
      sourceBranch,
      targetBranch,
      app,
      token,
      say
    )
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

    res.on("end", async () => {
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

      let pushMsg;
      if (force == true) {
        pushMsg = "Force pushed";
      } else {
        pushMsg = "Pushed";
      }

      let msg = "";

      const path = `/repos/${app}/git/refs/heads/${targetBranch}`;
      const method = "PATCH";
      msg = `${pushMsg} commit \`${sha}\` to branch \`${targetBranch}\`\nTriggered deploy \`${sourceBranch}\` to \`${targetBranch}\` for \`${app}\`! :rocket:`;
      const out = await request({
        api,
        path,
        method,
        token,
        data: postData,
        say,
        msg,
      });
      if (out) {
        const json = JSON.parse(out);
        console.log(json);
      }
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.end();

  return true;
};
