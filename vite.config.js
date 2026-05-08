import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: 'jnueat-api-recommend',
        configureServer(server) {
          server.middlewares.use('/api/recommend', async (req, res) => {
            try {
              const { default: handler } = await import('./api/recommend.js');
              await handler(req, res);
            } catch (e) {
              console.error('[api/recommend]', e);
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: e?.message ?? 'middleware error' }));
            }
          });
        },
      },
    ],
    server: { port: 5173, open: true },
  };
});
