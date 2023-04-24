const push = async ({ command, respond, say, force }) => {
  try {
    await branchPush(command, force, respond, say);
  } catch (error) {
    await respond(`Deploy ${command.text} failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = push;

const branchPushCheckConfiguration = function (
  sourceBranch,
  targetBranch,
  app,
  token,
  respond
) {
  const deployTargets = process.env.GITHUB_TARGET_BRANCHES.split(",");
  if (!token) {
    respond("Missing configuration: GITHUB_TOKEN");
    return false;
  }
  if (!app) {
    respond(
      "Missing configuration: [for :owner/:repo] or GITHUB_OWNER/GITHUB_REPO"
    );
    return false;
  }
  if (!sourceBranch) {
    respond("Missing <sourceBranch>: deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!targetBranch) {
    respond("Missing <targetBranch>: deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!process.env.GITHUB_TARGET_BRANCHES) {
    respond("Missing configuration: GITHUB_TARGET_BRANCHES");
    return false;
  }
  if (!Array.from(deployTargets).includes(targetBranch)) {
    respond(
      `\"${targetBranch}\" is not in available target branches. Use \`deploy list targets\``
    );
    return false;
  }

  return true;
};

const branchPush = function (command, force, respond, say) {
  const https = require("https");
  const data = command.text.split(" ");
  const sourceBranch = data[0].trim(); // sourceBranch
  const targetBranch = data[2].trim(); // targetBranch
  const app = data[4] || process.env.GITHUB_REPO; // owner
  const token = process.env.GITHUB_TOKEN;
  const api = process.env.GITHUB_API || "api.github.com";

  if (
    !branchPushCheckConfiguration(
      sourceBranch,
      targetBranch,
      app,
      token,
      respond
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

    res.on("end", () => {
      let sha = "";
      try {
        sha = JSON.parse(data).object.sha;
      } catch (error) {
        respond(`I failed to find branch \"${sourceBranch}\"!`);
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
          respond(`${pushMsg} commit \"${sha}\" to branch \"${targetBranch}\"`);
          say(`\`deploy ${command.text}\` triggered! :rocket:`);
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
