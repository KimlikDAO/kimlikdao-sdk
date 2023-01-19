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
    sectionNames: string[]
  ): Promise<did.DecryptedInfos>;

  getValidated(
    didContract: string,
    sectionNames: string[],
    validateOwnerAddress?: boolean
  ): Promise<any>;
}
