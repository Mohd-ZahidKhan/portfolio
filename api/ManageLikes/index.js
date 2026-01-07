const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.CosmosDbConnectionString);
const container = client.database("PortfolioDB").container("LikeTracker");

module.exports = async function (context, req, counterDoc) {
    const rawIp = req.headers['x-forwarded-for'] || "unknown";
    const cleanIp = rawIp.split(',')[0].split(':')[0];

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // --- GET REQUEST: Check Status & Count ---
    if (req.method === "GET") {
        let userHasLiked = false;
        
        // 1. Check if this specific User (IP) exists in DB
        try {
            const { resource: existingLike } = await container.item(cleanIp, cleanIp).read();
            if (existingLike) {
                userHasLiked = true;
            }
        } catch (error) {
            // Ignore 404 (Not Found) - it just means they haven't liked yet
        }

        // 2. Return Count AND Status
        context.res = {
            headers: corsHeaders,
            body: { 
                likes: counterDoc ? counterDoc.likes : 0,
                userHasLiked: userHasLiked // <--- This is the new flag
            }
        };
        return;
    }

    // --- POST REQUEST: Add Like ---
    if (req.method === "POST") {
        try {
            const { resource: existingLike } = await container.item(cleanIp, cleanIp).read();
            if (existingLike) {
                context.res = {
                    status: 403,
                    headers: corsHeaders,
                    body: { message: "ALREADY_LIKED" }
                };
                return;
            }
        } catch (error) {
            if (error.code !== 404) {
                context.res = { status: 500, headers: corsHeaders, body: "Database Error" };
                return;
            }
        }

        context.bindings.newTrackerDoc = { id: cleanIp, ip: cleanIp, timestamp: new Date().toISOString() };
        
        if (!counterDoc) { counterDoc = { id: "likes-counter", likes: 0 }; }
        counterDoc.likes = (counterDoc.likes || 0) + 1;
        context.bindings.updatedCounterDoc = counterDoc;

        context.res = {
            status: 200,
            headers: corsHeaders,
            body: { likes: counterDoc.likes, message: "Like Added" }
        };
    }
};