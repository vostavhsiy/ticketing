import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const server = express();

  server.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'gateway' });
  });

  server.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/',
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying to auth-service: ${req.method} ${req.url}`);
      },
    }),
  );

  server.use(
    '/tickets',
    createProxyMiddleware({
      target: 'http://localhost:4001',
      changeOrigin: true,
      pathRewrite: {
        '^/tickets': '/',
      },
    }),
  );

  server.use(
    '/orders',
    createProxyMiddleware({
      target: 'http://localhost:4002',
      changeOrigin: true,
      pathRewrite: {
        '^/orders': '/',
      },
    }),
  );

  await server.listen(5000);
}

bootstrap();
