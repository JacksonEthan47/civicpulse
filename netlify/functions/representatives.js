const https = require("https");

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;

// helper to make https requests without fetch
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(body) });
        } catch (err) {
          reject(new Error("Failed to parse response"));
        }
      });
    }).on("error", reject);
  });
}

exports.handler = async function (event) {
  const zip = event.queryStringParameters?.zip;

  if (!zip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Zip code is required" }),
    };
  }

  if (!OPENSTATES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  try {
    // Step 1: convert zip to lat/lng
    const geo = await httpsGet(`https://api.zippopotam.us/us/${zip}`);

    if (!geo.ok) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Invalid zip code" }),
      };
    }

    const lat = parseFloat(geo.data.places[0].latitude);
    const lng = parseFloat(geo.data.places[0].longitude);

    // Step 2: fetch representatives from OpenStates
    const reps = await httpsGet(
      `https://v3.openstates.org/people.geo?lat=${lat}&lng=${lng}&apikey=${OPENSTATES_API_KEY}`
    );

    if (!reps.ok) {
      return {
        statusCode: reps.status,
        body: JSON.stringify({ error: "OpenStates API error" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reps.data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
