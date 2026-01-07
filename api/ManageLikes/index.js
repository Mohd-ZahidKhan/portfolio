module.exports = async function (context, req, trackerDoc, counterDoc) {
    // 1. Get User IP (Azure provides this header)
    const clientIp = req.headers['x-forwarded-for'] || "unknown-ip";

    // 2. Initialize Counter if missing (Safety Check)
    if (!counterDoc) {
        counterDoc = { id: "likes-counter", likes: 0 };
    }

    // --- GET REQUEST: Just return the current number ---
    if (req.method === "GET") {
        context.res = {
            headers: {
                "Access-Control-Allow-Origin": "*", // Or your specific domain
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Content-Type": "application/json"
            },
            body: { likes: counterDoc.likes }
        };
        return;
    }

    // --- POST REQUEST: Try to Add a Like ---
    if (req.method === "POST") {
        
        // 3. SECURITY CHECK: Did we find a receipt for this IP?
        if (trackerDoc) {
            // YES: They already liked. BLOCK THEM.
            context.res = {
                status: 403, 
                headers: { "Access-Control-Allow-Origin": "*" },
                body: { message: "ALREADY_LIKED" }
            };
            return;
        }

        // 4. NO RECEIPT FOUND: Process the Like
        
        // A. Create the receipt for this IP
        context.bindings.newTrackerDoc = {
            id: clientIp,
            ip: clientIp,
            timestamp: new Date().toISOString()
        };

        // B. Increment the Global Counter
        counterDoc.likes = (counterDoc.likes || 0) + 1;
        context.bindings.updatedCounterDoc = counterDoc;

        // C. Send Success Response
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: { 
                likes: counterDoc.likes,
                message: "Like Added"
            }
        };
    }
};