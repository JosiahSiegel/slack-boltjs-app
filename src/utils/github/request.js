import https from "https";
const request = async function ({ api, path, method, token, data, say, msg }) {
  const out = httpsRequest(api, path, method, token, data, say, msg)
    .then((json) => {
      return json;
    })
    .catch((e) => {
      console.error(`error: ${e}`);
    });

  const getPromise = async () => {
    const a = await out;
    return a;
  };

  const b = await getPromise();
  return b;
};

export default request;

function httpsRequest(api, path, method, token, data, say, msg) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: api,
      port: 443,
      path: path,
      method: method,
      headers: {
        "User-Agent": "request",
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve(body);
        if (msg) {
          say(msg);
        }
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    if (data) {
      req.write(data);
    }
    req.end();
  });
}
