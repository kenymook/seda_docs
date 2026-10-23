import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Serve only this build's static output; no source files or filesystem traversal. */
export function createPilotServer({
  root = path.resolve(process.env.SEDA_PILOT_DIST || path.join(import.meta.dirname, 'dist')),
  port = Number(process.env.SEDA_PILOT_PORT || 5184),
  host = '127.0.0.1',
} = {}) {
  root = path.resolve(root);
  const server = http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); response.end(); return; }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || relative.includes('\0')) {
      response.writeHead(403); response.end(); return;
    }
    try {
      const bytes = await fs.readFile(file);
      const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found. Run npm run build before starting this server.');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = await createPilotServer();
  console.log(`SEDA parametric pilot http://127.0.0.1:${server.address().port}`);
}
