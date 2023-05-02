const run_workflow = async ({ message, say }) => {
  try {
    await runWorkflow(message, say);
  } catch (error) {
    await say(`${message.text} failed with error: ${error}`);
    console.error(error);
  }
};

module.exports = run_workflow;

const runWorkflow = function (message, say) {
  const https = require("https");
  const data = message.text.split(" ");
  const workflowFile = data[2].trim();
  const arg1Value = data[3].trim();
  const app = data[4] || process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const api = process.env.GITHUB_API || "api.github.com";

  // The inputs for the workflow_dispatch event
  const inputs = {
    env_name: `${arg1Value}`,
  };

  // The request body
  const body = JSON.stringify({
    ref: "master", // The reference of the branch to run the workflow from
    inputs: inputs, // The inputs for the workflow_dispatch event
  });

  //say(`${workflowFile} ${arg1Value} ${body}`);

  const url = `https://${api}/repos/${app}/actions/workflows/${workflowFile}/dispatches`;
  // The request options
  const options = {
    method: "POST",
    headers: {
      "User-Agent": "request",
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };

  // Create a new request using https
  const req = https.request(url, options, (res) => {

    let postResData = "";

    res.on("data", (chunk) => {
      postResData += chunk;
    });

    res.on("end", () => {
      say(`triggered!`);
    });

    // Check if the request was successful
    if (res.statusCode === 204) {
      // Log a success message
      console.log("Workflow triggered successfully");
    } else {
      // Log an error message with the status code and text
      console.error(`${res.statusCode}: ${res.statusMessage}`);
    }
  });

  // Write the request body to the request stream
  req.write(body);

  // End the request
  req.end();
  return true;
};
