import https from "https";

const key = "REDACTED_API_KEY";
const body = JSON.stringify({
  contents: [{ parts: [{ text: "Say hello in one word" }] }],
});

const options = {
  hostname: "generativelanguage.googleapis.com",
  path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => console.log(data));
});

req.on("error", (e) => console.error(e));
req.write(body);
req.end();
