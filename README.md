# KimlikDAO wallet login SDK

### Client

To use KimlikDAO SDK in your app, import `@kimlikdao/client`, instantiate it
and call `kimlikdao.getValidated()` or `kimlikdao.getUnvalidated()` like so:

```javascript
// In the web app
import { KimlikDAO } from "@kimlikdao/client";

const kimlikdao = new KimlikDAO({
  validatorUrl: "https://my-awesome-onramp.com/validate",
  provider: window.ethereum, // Optional
});

// In an async function
const tckt = await kimlikdao.getValidated(kimlikdao.TCKT, [
  "personInfo",
  "addressInfo",
  "contactInfo",
]);
```

This will

- send the user wallet some signature requests
- decrypt the specified `did.Section`s (`personInfo`, `addressInfo`, `contactInfo`)
- send them for validation at the specified url (https://my-awesome-onramp.com/validate) and
- pass on the response from the validator verbatim.

### Server

In our server at https://my-awesome-onramp.com/validate,

```javascript
// In the server
import { Validator } from "@kimlikdao/server-js";
import express from "express";

const validator = new Validator({
  "0x1": "https://ethereum.publicnode.com",
  "0xa86a": "https://api.avax.network/ext/bc/C/rpc",
  ipfs: "https://ipfs.kimlikdao.org",
});

express()
  .use(express.json())
  .post("/validate", (req, res) => {
    validator
      .validate(/** @type {!kimlikdao.ValidationRequest} */(req.body))
      .then((/** @type {!kimlikdao.ValidationReport} */ report) => {
        if (report.isValid) myDb.write(res.body);
        res.send(report);
      });
  })
  .listen(8787);
```

## Development

```shell
git clone --recursive https://github.com/KimlikDAO/kimlikdao-sdk
cd kimlikdao-sdk
bun i # Install dependencies
bun examples/simple-example/server.js
```

and navigate to localhost:9090.
