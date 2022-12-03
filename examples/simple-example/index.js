
import Cüzdan from './wallet'
import dom from "../../lib/util/dom"
import kimlikdao from "../../client/kimlikdao"

dom.adla("nas").onclick = callHasTckt;
dom.adla("naz").onclick = callGetInfoSections;

async function callHasTckt() {
  console.log("clicked on hasTckt button!")
  console.log(await kimlikdao.hasTckt())
  dom.adla("hasTcktOutput").innerHTML = "hasTckt: " + await kimlikdao.hasTckt()
}

async function callGetInfoSections() {
  console.log("clicked on getInfoSection button!")
  console.log(await kimlikdao.getInfoSections(Cüzdan.adres(), ["personInfo"]))
}