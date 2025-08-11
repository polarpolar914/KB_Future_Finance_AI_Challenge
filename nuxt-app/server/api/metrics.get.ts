import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

export default defineEventHandler(async () => {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType }
  });
});
