const { kv } = require('@vercel/kv');

module.exports = async (request, response) => {
  
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*'); 
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log("API Called:", request.method); 

    
    if (request.method === 'GET') {
      const likes = await kv.get('portfolio_likes');
      
      return response.status(200).json({ likes: likes || 0 });
    }

    
    if (request.method === 'POST') {
      const likes = await kv.incr('portfolio_likes');
      return response.status(200).json({ likes });
    }

    
    return response.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Database Error:", error); 
    return response.status(500).json({ error: error.message });
  }
};