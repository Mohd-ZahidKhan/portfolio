const { createClient } = require('@vercel/kv');

const kv = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (request, response) => {
  
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') return response.status(200).end();

 
  const ip = request.headers['x-forwarded-for'] || 'unknown_ip';

  try {
    
    if (request.method === 'GET') {
      
      const count = await kv.scard('portfolio_likers');
      
      
      const isMember = await kv.sismember('portfolio_likers', ip);

      return response.status(200).json({ 
        likes: count, 
        userHasLiked: isMember === 1 
      });
    }

    
    if (request.method === 'POST') {
      
      await kv.sadd('portfolio_likers', ip);
      
      
      const count = await kv.scard('portfolio_likers');
      
      return response.status(200).json({ likes: count, success: true });
    }

    return response.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("DB Error:", error);
    return response.status(500).json({ error: error.message });
  }
};