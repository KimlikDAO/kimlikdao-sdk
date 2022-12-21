# KimlikDAO wallet login SDK

### Client

To use KimlikDAO SDK in your app, import `@kimlikdao/client`, instantiate it
and call `kimlikdao.validate()` like so:

```javascript
// In the web app
import { KimlikDAO } from "@kimlikdao/client";

const kimlikdao = new KimlikDAO({
  validatorUrl: "https://my-awesome-onramp.com/validate",
  provider: window.ethereum,
});

kimlikdao
  .validate(kimlikdao.TCKT, ["personInfo", "addressInfo", "contactInfo"])
  .then((res) => (res.ok ? res.json() : Promise.reject()))
  .then(console.log)
  .catch(() => console.log("The connected wallet doesn't have a valid TCKT"));
```

This will

- send the user wallet some signature requests
- decrypt the specified `InfoSection`s (`personInfo`, `addressInfo`, `contactInfo`)
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
  kimlikdao: "https://node.kimlikdao.org",
});

express()
  .use(express.json())
  .post("/validate", (req, res) => {
    validator.validate(req.body).then((result) => {
      if (result.success) myDb.write(res.body);
      res.send(result);
    });
  })
  .listen(8787);
```

## Development

```shell
git clone --recursive https://github.com/KimlikDAO/kimlikdao-sdk
cd kimlikdao-sdk
yarn # Install dependencies
node examples/index
```

and navigate to localhost:9090.
