/**
 * @fileoverview
 */

window["kimlikdao"] = {};

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validateInfoSection()`
 * method.
 *
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
kimlikdao.hasTckt = () => {
  return Promise.resolve(false);
}

/**
 * @param {Array<string>} infoSections
 * @return {Promise<Object<string, InfoSection>>}
 */
kimlikdao.getInfoSections = (infoSections) => {
  console.log(infoSections);
  return Promise.resolve({});
}

/**
 * @constructor
 * 
 * @param {string} url
 */
kimlikdao.Validator = function (url) {
  this.url = url;
}

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is parsed as a json file and
 * returned to the caller verbatim.
 *
 * @param {Array<string>} infoSections
 * @param {kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateInfoSections = (infoSections, validator, validateAddress) => {
  console.log(infoSections, validator, validateAddress);
  return Promise.resolve({});
}
