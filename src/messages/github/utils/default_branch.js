const request = require("./request");

const default_branch = async function ({ api, app, token, say, msg }) {
  const path = `/repos/${app}`;
  const method = "GET";
  const data = "";
  const out = await request({ api, path, method, token, data, say, msg });
  const json = JSON.parse(out);
  return json.default_branch;
};

module.exports = default_branch;
