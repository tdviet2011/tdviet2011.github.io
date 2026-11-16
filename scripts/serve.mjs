import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.woff':'font/woff', '.txt':'text/plain; charset=utf-8' };
try { await stat(path.join(root,'index.html')); } catch { console.error('Chưa có bản build. Chạy npm ci và npm run build trước.'); process.exit(1); }
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const file = path.resolve(root, `.${pathname==='/'?'/index.html':pathname}`);
    const relative = path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403);res.end('Forbidden');return; }
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(data);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found'); }
});
server.on('error',error=>{console.error(`Không mở được cổng ${port}: ${error.message}`);process.exit(1);});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${port}/`;
  console.log(`Portfolio: ${url}\nNhấn Ctrl+C để dừng.`);
  if(process.argv.includes('--open')) {
    const args=process.platform==='win32'?['/d','/c','start','',url]:[url];
    const command=process.platform==='win32'?'cmd.exe':process.platform==='darwin'?'open':'xdg-open';
    const child=spawn(command,args,{stdio:'ignore',windowsHide:true});
    child.on('error',()=>console.log(`Mở thủ công địa chỉ ${url}`));
  }
});
