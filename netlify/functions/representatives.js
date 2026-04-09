exports.handler = async function (event) {
    const zip = event.queryStringParameters.zip;

    if (zip) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Zip code is required"}),
        };
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const url = 'https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&key=${apiKey}';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({error: data.error?.message || "API error"}),
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json"},
            body:JSON.stringify(data),
        };
     }  catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Something went wrong"}),
        };
     }
};
