module.exports = async function (context, req, counterDoc) {
    // If the document is missing, start at 0
    let currentCount = counterDoc ? counterDoc.count : 0;

    // Increment
    currentCount++;

    // Update the database object
    if (!counterDoc) {
        counterDoc = { id: "main-counter", count: currentCount };
    } else {
        counterDoc.count = currentCount;
    }

    // Save back to Cosmos DB
    context.bindings.updatedDoc = counterDoc;

    // Send the response to the website
    context.res = {
        body: { 
            count: currentCount 
        }
    };
}