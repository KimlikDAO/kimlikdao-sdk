pub struct TCKT {}

type ChainId = u32;
#[allow(non_camel_case_types)]
type address = [u8; 20];
#[allow(non_camel_case_types)]
type bytes32 = [u8; 32];

impl TCKT {
    pub fn handle_of(&self, addr: address) -> bytes32 {
        return [0; 32];
    }

    pub fn exposure_reported(&self, chainId: ChainId, addr: address) -> u64 {
        return 0;
    }
}
