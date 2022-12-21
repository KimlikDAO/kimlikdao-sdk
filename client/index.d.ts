declare class KimlikDAO {
  constructor(
    validationUrl: string,
    provider: eth.Provider,
    generateChallenge: () => Promise<kimlikdao.Challenge>
  );
}
