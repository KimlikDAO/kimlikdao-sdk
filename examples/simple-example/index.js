
import kimlikdao from "../../client/kimlikdao";
import dom from "../../lib/util/dom";
import Wallet from './wallet';

dom.adla("nas").onclick = callHasTckt;
dom.adla("naz").onclick = callGetInfoSections;

async function callHasTckt() {
  console.log("clicked on hasTckt button!")
  console.log(await kimlikdao.hasTckt())
  dom.adla("hasTcktOutput").innerHTML = "hasTckt: " + await kimlikdao.hasTckt()
}

async function callGetInfoSections() {
  console.log("clicked on getInfoSection button!")
  console.log(await kimlikdao.getInfoSections(Wallet.adres(), ["personInfo"]))
}
