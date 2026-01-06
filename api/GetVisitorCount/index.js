module.exports = async function (context, req, counterDoc) {
    // 1. Get current count (default to 0 if doc is missing)
    let currentCount = counterDoc ? counterDoc.count : 0;

    // 2. Increment count
    currentCount++;

    // 3. Update the database object
    if (!counterDoc) {
        counterDoc = { id: "main-counter", count: currentCount };
    } else {
        counterDoc.count = currentCount;
    }

    // 4. Save back to Cosmos DB
    context.bindings.updatedDoc = counterDoc;

    // 5. Send response WITH CORS HEADERS
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Content-Type": "application/json"
        },
        body: { 
            count: currentCount,
            message: "Azure Cosmos DB Connection Successful"
        }
    };
}
