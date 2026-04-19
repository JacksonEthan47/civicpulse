const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;

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
    const geoResponse = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!geoResponse.ok) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Invalid zip code" }),
      };
    }

    const geoData = await geoResponse.json();

    // parse as float so OpenStates receives numbers not strings
    const lat = parseFloat(geoData.places[0].latitude);
    const lng = parseFloat(geoData.places[0].longitude);

    // Step 2: fetch representatives from OpenStates
    const url = `https://v3.openstates.org/people.geo?lat=${lat}&lng=${lng}&apikey=${OPENSTATES_API_KEY}`;

    const openstatesResponse = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!openstatesResponse.ok) {
      return {
        statusCode: openstatesResponse.status,
        body: JSON.stringify({ error: "OpenStates API error" }),
      };
    }

    const data = await openstatesResponse.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    // give a clear message if a timeout occurred
    const message = err.name === "TimeoutError"
      ? "Request timed out — please try again"
      : err.message;

    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};
