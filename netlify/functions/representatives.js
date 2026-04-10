const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
exports.handler = async function (event) {
    const zip = event.queryStringParameters.zip;

    if (!zip) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Zip code is required"}),
        };
    }


    if (!OPENSTATES_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not configured"}),
        };
    }

    try {
        //Step 1: convert zip code to lat/lng
        const geoResponse = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (!geoResponse.ok) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Invalid zip code"}),
            };
        }
        const geoData = await geoResponse.json();
        const lat = geoData.places[0].latitude;
        const lng = geoData.places[0].longitude;

        //step 2: pass lat/lng to OpenStates
        const url = `https//v3.openstates.org/people.geo?lat=${lat}&lng=${lng}&apikey=${OPENSTATES_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "OpenStates API error", details: data}),
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
