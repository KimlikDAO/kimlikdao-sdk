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
}
