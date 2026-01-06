module.exports = async function (context, req, counterDoc) {
    // 1. Initialize DB doc if missing (Safety check)
    if (!counterDoc) {
        counterDoc = { id: "main-counter", count: 0, likes: 0, visitors: [] };
    }
    // Ensure 'likes' field exists
    if (!counterDoc.likes) {
        counterDoc.likes = 0;
    }

    // 2.If it's a POST request, Add a Like
    if (req.method === "POST") {
        counterDoc.likes += 1;
        // Save back to DB
        context.bindings.updatedDoc = counterDoc;
    }

    // 3. Send Response (With CORS Headers for GitHub Pages)
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Content-Type": "application/json"
        },
        body: { 
            likes: counterDoc.likes 
        }
    };
}