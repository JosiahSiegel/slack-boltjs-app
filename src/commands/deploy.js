const deploy = async ({ sourceBranch, targetBranch, owner, repo, say }) => {
  try {
    say(`${sourceBranch}`);
    await say(`${sourceBranch}`);

    await branchPush(sourceBranch, targetBranch, owner, repo, true, say);
  } catch (error) {
    const sourceBranch = context.matches[1];
    const targetBranch = context.matches[2];
    await say(`${sourceBranch} failed`);
    console.error(error);
  }
};

module.exports = deploy;

const branchPushCheckConfiguration = function (
  sourceBranch,
  targetBranch,
  respond
) {
  const token = process.env.GITHUB_TOKEN;
  const owner = context.match[3] || process.env.GITHUB_OWNER;
  const repo = context.match[4] || process.env.GITHUB_REPO;
  const deployTargets = process.env.GITHUB_DEPLOY_TARGETS.split(",");

  if (!token) {
    respond("Missing configuration: GITHUB_TOKEN");
    return false;
  }
  if (!owner) {
    respond("Missing configuration: [for :owner/:repo] or GITHUB_OWNER");
    return false;
  }
  if (!repo) {
    respond("Missing configuration: [for :owner/:repo] or GITHUB_REPO");
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
  if (!process.env.GITHUB_DEPLOY_TARGETS) {
    respond("Missing configuration: GITHUB_DEPLOY_TARGETS");
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

const branchPush = function (
  sourceBranch,
  targetBranch,
  owner,
  repo,
  force,
  respond
) {
  const https = require("https");
  branchPushCheckConfiguration(sourceBranch, targetBranch, respond);

  const token = process.env.GITHUB_TOKEN;
  const api = process.env.GITHUB_API || "api.github.com";

  const app = `${owner}/${repo}`;

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
