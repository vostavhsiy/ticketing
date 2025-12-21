import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer();

const SERVICES = {
  '/auth': 'http://localhost:4000',
  '/tickets': 'http://localhost:4001',
  '/orders': 'http://localhost:4002',
};

@Controller()
export class AppController {
  @All('*path')
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    const target = this.getTargetService(req.url);

    if (!target) {
      return res.status(404).json({ error: 'Service not found' });
    }

    req.url = req.url.replace(target.prefix, '') || '/';

    console.log(`Proxying request to: ${target.url}${req.url}`);

    proxy.web(
      req,
      res,
      {
        target: target.url,
        changeOrigin: true,
      },
      (error) => {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Service unavailable' });
      },
    );
  }

  private getTargetService(
    path: string,
  ): { url: string; prefix: string } | null {
    for (const [prefix, url] of Object.entries(SERVICES)) {
      if (path.startsWith(prefix)) {
        return { url, prefix };
      }
    }
    return null;
  }
}
