import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityManager {
    mapping(bytes32 => address) public ownerOfDid; // didHash -> owner

    event DIDCreated(address indexed owner, bytes32 didHash);

    // simulate DID creation (in prod you'd use Polygon ID / ZK proof)
    function createDID(bytes32 didHash) external {
        require(ownerOfDid[didHash] == address(0), "DID exists");
        ownerOfDid[didHash] = msg.sender;
        emit DIDCreated(msg.sender, didHash);
    }

    function verifyDID(bytes32 didHash, address who) external view returns (bool) {
        return ownerOfDid[didHash] == who;
    }
}
