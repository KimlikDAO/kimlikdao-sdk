// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

struct Signature {
    bytes32 r;
    uint256 yParityAndS;
}

function validateHumanID(
    bytes32 humanID,
    uint256 timestamp,
    Signature calldata sig,
    bytes32 commitmentR
) view {
    bytes32 digest = keccak256(
        abi.encode(
            uint256(bytes32("\x19KimlikDAO hash\n")) | timestamp,
            keccak256(abi.encodePacked(commitmentR, msg.sender)),
            humanID
        )
    );
    address signer = ecrecover(
        digest,
        uint8(sig.yParityAndS >> 255) + 27,
        sig.r,
        bytes32(sig.yParityAndS & ((1 << 255) - 1))
    );
    require(
        // node.kimlikdao.org
        signer == 0x299A3490c8De309D855221468167aAD6C44c59E0 ||
            // kdao-node.yenibank.org
            signer == 0x86f6B34A26705E6a22B8e2EC5ED0cC5aB3f6F828 ||
            // kdao-node.lstcm.co
            signer == 0x384bF113dcdF3e7084C1AE2Bb97918c3Bf15A6d2
    );
}
