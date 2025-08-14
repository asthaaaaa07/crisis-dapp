// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImpactNFT is ERC721, Ownable {
    uint256 public nextId;
    mapping(uint256 => string) public tokenURIMap;

    constructor() ERC721("ImpactNFT", "IMPNFT") {}

    function mintImpact(address to, string memory metadataCID) external onlyOwner returns (uint256 id) {
        id = ++nextId;
        _mint(to, id);
        tokenURIMap[id] = metadataCID;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenURIMap[tokenId];
    }
}