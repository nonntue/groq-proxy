// index.js (Node.js 版本)
const http = require('http');
const url = require('url');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  res.setHeader('Content-Type', 'application/json');
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (parsedUrl.pathname === '/health' && req.method === 'GET') {
    res.end(JSON.stringify({ 
      status: 'ok', 
      provider: 'groq',
      hasKey: !!GROQ_API_KEY

}));
    return;
  }

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Use POST' }));return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {

method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:data.model || 'llama3-8b-8192',
          messages: data.messages,
          temperature: data.temperature ?? 0.7,
          max_tokens: data.max_tokens ?? 2048,
        }),
      });

      const result

= await response.json();
      res.statusCode = response.status;
      res.end(JSON.stringify(result));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
