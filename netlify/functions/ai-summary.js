const https = require("https");

exports.handler = async function (event) {
  // handler accepts GET requests from the frontend
  const { name, role, party } = event.queryStringParameters || {};

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing representative name" }),
    };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  const prompt = `You are a neutral, nonpartisan civic information assistant for CivicPulse, a tool that helps Chicago residents understand their elected officials.

Write a brief 3-sentence summary of ${name}, who serves as ${role || "an elected official"} and is a member of the ${party || "unknown"} party.

Guidelines:
- Be factual and neutral — no opinion, no bias toward any party
- Write in plain English that any voter can understand
- Focus on their role, responsibilities, and what they do for constituents
- Do not speculate or invent facts
- If you do not have reliable information about this specific person, say so honestly

Keep the summary to 3 sentences maximum.`;

  const requestBody = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          const summary = data?.content?.[0]?.text;

          if (!summary) {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: "No summary returned from Claude" }),
            });
            return;
          }

          resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary }),
          });
        } catch (err) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to parse Claude response" }),
          });
        }
      });
    });

    req.on("error", (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: "Request failed", detail: err.message }),
      });
    });

    req.write(requestBody);
    req.end();
  });
};