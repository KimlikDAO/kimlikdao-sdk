
import { KimlikDAO } from "/client/index";
import Wallet from './wallet';

/** @const {Element} */
const HasDIDButton = document.getElementById("se_hasDIDButton");
/** @const {Element} */
const HasDIDOut = document.getElementById("se_hasDIDOut");
/** @const {Element} */
const GetUnvalidatedButton = document.getElementById("se_getUnvalidatedButton");
/** @const {Element} */
const GetUnvalidatedOut = document.getElementById("se_getUnvalidatedOut");
/** @const {Element} */
const GetValidatedButton = document.getElementById("se_getValidatedButton");
/** @const {Element} */
const GetValidatedOut = document.getElementById("se_getValidatedOut");

if (!window.ethereum)
  console.log("Couldn't find a provider.");

/** @const {KimlikDAO} */
const kimlikdao = new KimlikDAO({
  validatorUrl: "localhost/validate",
  provider: ethereum
});

HasDIDButton.onclick = () => {
  console.log("Clicked on hasDID() button!")
  kimlikdao.hasDID(kimlikdao.TCKT)
    .then((res) => {
      const out = "hasDID(): " + res;
      HasDIDOut.innerText = out;
      console.log(out);
    })
    .catch(console.log);
}

GetUnvalidatedButton.onclick = () => {
  console.log("Clicked on getUnvalidated() button!")
  kimlikdao.getUnvalidated(kimlikdao.TCKT, ["personInfo"])
    .then((res) => {
      const out = "getUnvalidated(): " + res;
      GetUnvalidatedOut.innerText = out;
      console.log(out);
    })
    .catch(console.log);
}

GetValidatedButton.onclick = () => {
  console.log("Clicked on getValidated() button!")
  kimlikdao.getValidated(kimlikdao.TCKT, ["personInfo"])
    .then((res) => {
      const out = "getValidated(): " + res;
      GetValidatedOut.innerText = out;
      console.log(out);
    })
    .catch(console.log);
}
