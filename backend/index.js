import { createApp, toNodeListener, defineEventHandler, readBody, createError } from 'h3';
import fetch from 'node-fetch';
import { createServer } from 'node:http';

const app = createApp();

app.use('/api/risk/score', defineEventHandler(async (event) => {
  const body = await readBody(event);
  const url = process.env.ML_SERVICE_URL || 'http://localhost:8000/score';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ features: body.features })
  });

  if (!res.ok) {
    const text = await res.text();
    throw createError({ statusCode: 502, statusMessage: `ML error: ${text}` });
  }

  return await res.json();
}));

const server = createServer(toNodeListener(app));
server.listen(3001, '0.0.0.0');
