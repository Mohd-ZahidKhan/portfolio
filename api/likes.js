import { kv } from '@vercel/kv';

export default async function handler(request, response) {
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
    if (request.method === 'GET') {
      const likes = await kv.get('portfolio_likes') || 0;
      return response.status(200).json({ likes });
    }

    if (request.method === 'POST') {
      const likes = await kv.incr('portfolio_likes');
      return response.status(200).json({ likes });
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}