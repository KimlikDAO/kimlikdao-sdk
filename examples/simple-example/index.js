
import { KimlikDAO } from "/client/index";
import Wallet from './wallet';

/** @const {Element} */
const HasDIDButton = document.getElementById("se_hasDIDButton");
/** @const {Element} */
const ValidateButton = document.getElementById("se_validateButton");
/** @const {Element} */
const HasDIDOut = document.getElementById("se_hasDIDOut");
/** @const {Element} */
const ValidateOut = document.getElementById("se_validateOut");

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

ValidateButton.onclick = () => {
  console.log("Clicked on validate() button!")
  kimlikdao.validate(kimlikdao.TCKT, ["personInfo"])
    .then((res) => {
      const out = "hasDID(): " + res;
      ValidateOut.innerText = out;
      console.log(out);
    })
    .catch(console.log);
}
