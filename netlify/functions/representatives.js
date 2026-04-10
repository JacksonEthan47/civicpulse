exports.handler = async function (event) {
  const zip = event.queryStringParameters.zip;

  if (!zip) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Zip code is required" }),
    };
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "API error",
          details: data.error || null,
          keyPresent: !!apiKey,
          keyLength: apiKey.length,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
