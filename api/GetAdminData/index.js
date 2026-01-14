module.exports = async function (context, req, allRecords) {

    const ADMIN_SECRET = process.env.ADMIN_PASSWORD; 

    const userKey = req.query.key;

    if (!ADMIN_SECRET) {
        context.res = { status: 500, body: "Server Error: Admin configuration missing." };
        return;
    }

    if (userKey !== ADMIN_SECRET) {
        context.res = {
            status: 401, 
            body: { message: "Access Denied: Wrong Key!! Please leave this Page Immediately your not authorized to visit this Page!!" }
        };
        return;
    }

    context.res = {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: allRecords
    };
}