import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=import.meta.dirname;
const repoRoot=path.resolve(process.env.SEDA_REPO_ROOT || path.join(root,'../../../..'));
const port=Number(process.env.SEDA_BASELINE_PORT||5183);
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const route=url.pathname;
  const special={'/tokens.json':path.join(repoRoot,'tokens.json'),'/portal-tokens.js':path.join(repoRoot,'portal/portal-tokens.js'),'/':'index.html'};
  const name=special[route]||route.slice(1);
  if(name.includes('..')&&!Object.hasOwn(special,route)){res.writeHead(403);res.end();return;}
  const file=path.resolve(root,name);
  fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404);res.end('Not found');return;}
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  });
}).listen(port,'127.0.0.1',()=>console.log(`SEDA baseline http://127.0.0.1:${port}`));
