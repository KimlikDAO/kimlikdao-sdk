import express from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'vite';

createServer({
  server: { middlewareMode: true },
  appType: 'custom'
}).then((vite) => {
  const app = express()
  app.use(vite.middlewares)
  console.log("path:", import.meta.url);
  app.use("/", (req, res, next) => {
    console.log(req.path);
    let page = readFileSync('examples/simple-example/index.html', 'utf-8');
    vite.transformIndexHtml(req.path, page).then((page) => {
      res.status(200)
        .set({ 'Content-type': 'text/html;charset=utf-8' })
        .end(page);
    }).catch((e) => {
      vite.ssrFixStacktrace(e)
      next(e)
    })
  })
  console.log(`Ana sayfaya şu adreste çalışıyor: http://localhost:9090`)
  app.listen(9090);
})
