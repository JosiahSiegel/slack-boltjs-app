import request from "./request.js";
import https from "https";

const push = async ({ args, api, respond, say, force, isCommand }) => {
  try {
    branchPush(args, api, force, respond, say, isCommand);
  } catch (error) {
    await respond(`Deploy failed with error: ${error}`);
    console.error(error);
  }
};

export default push;

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
    respond("Missing <sourceBranch>: gh-deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!targetBranch) {
    respond("Missing <targetBranch>: gh-deploy <sourceBranch> to <targetBranch>");
    return false;
  }
  if (!process.env.GITHUB_TARGET_BRANCHES) {
    respond("Missing configuration: GITHUB_TARGET_BRANCHES");
    return false;
  }
  if (!Array.from(deployTargets).includes(targetBranch)) {
    respond(
      `\"${targetBranch}\" is not in available target branches. Use:  <@bot name> gh-targets`
    );
    return false;
  }

  return true;
};

const branchPush = function (args, api, force, respond, say, isCommand) {
  let sourceBranch;
  let targetBranch;
  let app;
  if (isCommand) {
    sourceBranch = args[0];
    targetBranch = args[2];
    app = process.env.GITHUB_REPO || args[4];
  } else {
    sourceBranch = args[2];
    targetBranch = args[4];
    app = process.env.GITHUB_REPO || args[6];
  }
  const token = process.env.GITHUB_TOKEN;

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
      const out = await request({
        api,
        path,
        method,
        token,
        data: postData,
        say,
        msg: "",
      });
      if (out) {
        const json = JSON.parse(out);
        console.log(json);
        respond(`${pushMsg} commit \"${sha}\" to branch \"${targetBranch}\"`);
        say(
          `\`deploy ${sourceBranch} to ${targetBranch} for ${app}\` triggered! :rocket:`
        );
      }
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.end();

  return true;
};
