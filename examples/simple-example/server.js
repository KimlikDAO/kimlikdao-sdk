import express from 'express';
import { Validator } from "../../server-js/validator.js";
import { readFileSync } from 'fs';
import { createServer } from 'vite';

const validator = new Validator({
  "0x1": "https://ethereum.publicnode.com",
  "0xa86a": "https://api.avax.network/ext/bc/C/rpc",
  ipfs: "https://ipfs.kimlikdao.org",
});

createServer({
  server: { middlewareMode: true },
  appType: 'custom'
}).then((vite) => {
  const app = express()
  app.use(vite.middlewares)
  console.log("path:", import.meta.url);
  app.use("/", (req, res, next) => {
    if (req.path == '/validate') {
      validator.validate(/** @type {!kimlikdao.ValidationRequest} */(req.body))
        .then((/** @type {!kimlikdao.ValidationReport} */ report) => {
          res.set({ 'Content-type': 'application/json' })
          res.send(report);
        })
    };

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
  console.log(`Server running at: http://localhost:9090`)
  app.listen(9090);
})
