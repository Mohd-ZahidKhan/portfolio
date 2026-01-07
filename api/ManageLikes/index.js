const { CosmosClient } = require("@azure/cosmos");

// Initialize Client (Outside handler to reuse connection)
const client = new CosmosClient(process.env.CosmosDbConnectionString);
const container = client.database("PortfolioDB").container("LikeTracker");

module.exports = async function (context, req, counterDoc) {
    // 1. CLEAN THE IP (The Critical Fix)
    // Input: "103.66.213.81:23078, [ipv6]..."
    // Output: "103.66.213.81"
    const rawIp = req.headers['x-forwarded-for'] || "unknown";
    const cleanIp = rawIp.split(',')[0].split(':')[0];

    // GET Request: Just show count
    if (req.method === "GET") {
        context.res = {
            body: { likes: counterDoc ? counterDoc.likes : 0 }
        };
        return;
    }

    // POST Request: Process Like
    if (req.method === "POST") {
        
        // 2. MANUAL SECURITY CHECK
        // We query the DB explicitly using the CLEAN IP
        try {
            const { resource: existingLike } = await container.item(cleanIp, cleanIp).read();
            
            if (existingLike) {
                // STOP! They exist in the DB.
                context.res = {
                    status: 403,
                    body: { message: "ALREADY_LIKED" }
                };
                return;
            }
        } catch (error) {
            // If error is 404 (Not Found), that's good! We continue.
            if (error.code !== 404) {
                context.log.error("Cosmos DB Error:", error);
                context.res = { status: 500, body: "Database Error" };
                return;
            }
        }

        // 3. IF WE ARE HERE, IT IS A NEW LIKE
        
        // A. Create the Receipt (With the CLEAN ID)
        context.bindings.newTrackerDoc = {
            id: cleanIp,     
            ip: cleanIp,
            timestamp: new Date().toISOString()
        };

        // B. Update Global Counter
        if (!counterDoc) {
            counterDoc = { id: "likes-counter", likes: 0 };
        }
        counterDoc.likes = (counterDoc.likes || 0) + 1;
        context.bindings.updatedCounterDoc = counterDoc;

        // C. Success
        context.res = {
            status: 200,
            body: { 
                likes: counterDoc.likes,
                message: "Like Added"
            }
        };
    }
};