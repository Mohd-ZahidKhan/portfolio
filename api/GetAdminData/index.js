module.exports = async function (context, req, allRecords) {
    const ADMIN_SECRET = process.env.ADMIN_PASSWORD; 
    const userKey = req.query.key;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

   
    if (!ADMIN_SECRET) {
        context.res = { 
            status: 500, 
            headers: corsHeaders, 
            body: "Server Error: Admin configuration missing." 
        };
        return;
    }

  
    if (userKey !== ADMIN_SECRET) {
        context.res = {
            status: 401, 
            headers: corsHeaders, 
            body: {message: "⛔ Access Denied: PLEASE LEAVE THE PAGE YOU'RE UNAUTHORIZED TO ACCESS BEYOND THIS!!" }
        };
        return;
    }

    const ipList = visitorDoc ? visitorDoc.visitors : [];

    context.res = {
        status: 200,
        headers: corsHeaders,
        body: ipList
    };
}