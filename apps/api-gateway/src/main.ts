import { Logger } from '@nestjs/common';
import express from 'express';
import { ServerResponse } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';

function sendErrorResponse(
  res: ServerResponse,
  serviceName: string,
  statusCode = 500,
) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(
    JSON.stringify({
      error: `Something went wrong while connecting to ${serviceName}.`,
    }),
  );
}

async function bootstrap() {
  const server = express();

  const logger = new Logger('API-Gateway');
  //@ts-ignore
  logger.info = logger.log;

  server.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'gateway' });
  });

  server.use(
    '/auth',
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/',
      },
      logger,
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.log(`Proxying to auth-service: ${req.method} ${req.url}`);
        },
        error: (err, req, res) => {
          logger.error(
            `Error proxying request to auth-service: ${err.message}`,
          );
          sendErrorResponse(res as ServerResponse, 'auth-service');
        },
      },
    }),
  );

  server.use(
    '/tickets',
    createProxyMiddleware({
      target: process.env.TICKETS_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/tickets': '/',
      },
      logger,
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.log(`Proxying to tickets-service: ${req.method} ${req.url}`);
        },
        error: (err, req, res) => {
          logger.error(
            `Error proxying request to tickets-service: ${err.message}`,
          );
          sendErrorResponse(res as ServerResponse, 'tickets-service');
        },
      },
    }),
  );

  server.use(
    '/orders',
    createProxyMiddleware({
      target: process.env.ORDERS_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/orders': '/',
      },
      logger,
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.log(`Proxying to orders-service: ${req.method} ${req.url}`);
        },
        error: (err, req, res) => {
          logger.error(
            `Error proxying request to orders-service: ${err.message}`,
          );
          sendErrorResponse(res as ServerResponse, 'orders-service');
        },
      },
    }),
  );

  const port = process.env.PORT || 5000;

  await server.listen(port);
  logger.log(`API Gateway is running on http://localhost:${port}`);
}

bootstrap();
