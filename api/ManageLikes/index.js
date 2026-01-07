const { CosmosClient } = require("@azure/cosmos");

// Initialize Client
const client = new CosmosClient(process.env.CosmosDbConnectionString);
const container = client.database("PortfolioDB").container("LikeTracker");

module.exports = async function (context, req, counterDoc) {
    const rawIp = req.headers['x-forwarded-for'] || "unknown";
    const cleanIp = rawIp.split(',')[0].split(':')[0];

    // Standard CORS Headers for every response
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // GET Request
    if (req.method === "GET") {
        context.res = {
            headers: corsHeaders,
            body: { likes: counterDoc ? counterDoc.likes : 0 }
        };
        return;
    }

    // POST Request
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
                context.res = { 
                    status: 500, 
                    headers: corsHeaders,
                    body: "Database Error" 
                };
                return;
            }
        }

        // Create Receipt
        context.bindings.newTrackerDoc = {
            id: cleanIp,
            ip: cleanIp,
            timestamp: new Date().toISOString()
        };

        // Update Counter
        if (!counterDoc) {
            counterDoc = { id: "likes-counter", likes: 0 };
        }
        counterDoc.likes = (counterDoc.likes || 0) + 1;
        context.bindings.updatedCounterDoc = counterDoc;

        // Success
        context.res = {
            status: 200,
            headers: corsHeaders,
            body: { 
                likes: counterDoc.likes,
                message: "Like Added"
            }
        };
    }
};