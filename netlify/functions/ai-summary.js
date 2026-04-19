exports.handler = async function (event) {
    //handler accepts GET requests from the frontend

    const { name, role, party } = event.queryStringParameters || {};

    //validate we have the minimum data needed
    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing representative name"}),
        };
    }

    const ANTHROPIC_API_KEY = ProcessingInstruction.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not configured"}),
        };
    }

    //build the prompt we send to Claude
    const prompt = `You are a neutral, nonpartisan civic infomration assistant for CivicPulse, a tool that helps Chicago residents understand their elected officials.
    Write a breif 3-sentance summary of ${name}, who serves as ${role || "an elected official"} and is a member of the ${party || "uknown"} party.
    
    Guidelines:
    - Be factual and neutral - no opinion, no bias toward any party
    - Write in plain English that any voter can understand
    - Focus on their role, responsibilities, and what they do for constituents
    - Do not speculate or invent facts
    - If you do not have reiliable information about this specific person, say so honestly
    
    Keep the summary to 3 sentences maximum.`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-haiko-4-5-20251001",
                max_tokens: 300,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        const data = await response.json();

        //extract the text from Claud's response
        const summary = data?.content?.[0]?.text;

        if (!summary) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "No summary returned from Claude "}),
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ summary }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch summary", detail: err.message }),
        };
    }
};