/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

declare class KimlikDAO {
  validationUrl: string;
  provider: eth.Provider;
  generateChallenge: () => Promise<kimlikdao.Challenge>;

  constructor(params: KimlikDAO);

  hasDID(didContract: string): Promise<boolean>;

  getUnvalidated(
    didContract: string,
    infoSections: string[]
  ): Promise<did.DecryptedInfos>;

  getValidated(
    didContract: string,
    infoSections: string[],
    validateOwnerAddress?: boolean
  ): Promise<any>;
}
