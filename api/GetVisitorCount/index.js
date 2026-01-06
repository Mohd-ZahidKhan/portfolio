module.exports = async function (context, req, counterDoc) {
    // 1. Get the Client IP Address (Azure passes this in the header)
    const header = req.headers['x-forwarded-for'] || "";
    // If multiple IPs exist (proxy chain), take the first one
    const clientIP = header.split(':')[0] || "Unknown";

    // 2. Initialize the document if it's missing (First run)
    if (!counterDoc) {
        counterDoc = { 
            id: "main-counter", 
            count: 0,
            visitors: [] // New: Create a list to remember IPs
        };
    }

    // 3. Ensure the visitors array exists (in case old DB data didn't have it)
    if (!counterDoc.visitors) {
        counterDoc.visitors = [];
    }

    // 4. The Logic: Check if we have seen this IP before
    let isUnique = false;
    
    if (!counterDoc.visitors.includes(clientIP)) {
        // NEW VISITOR!
        counterDoc.count += 1;          // Increase number
        counterDoc.visitors.push(clientIP); // Save IP to list
        isUnique = true;
        
        // Save the updated list back to the Database
        context.bindings.updatedDoc = counterDoc;
    } else {
        // RETURNING VISITOR
        // We do NOT increment the count.
        // We do NOT save to the DB (saves money/performance).
        isUnique = false;
    }

    // 5. Send response (With the CORS Headers we fixed earlier)
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Content-Type": "application/json"
        },
        body: { 
            count: counterDoc.count,
            unique: isUnique, // Optional: Tell frontend if this was a new visit
            message: isUnique ? "Welcome New Visitor!" : "Welcome Back!"
        }
    };
}
