// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AidVoucher is ERC721, Ownable {
    uint256 public nextId;
    mapping(uint256 => bool) public redeemed;

    constructor() ERC721("AidVoucher", "VCHR") {}

    function mintVoucher(address to) external onlyOwner returns (uint256 id) {
        id = ++nextId;
        _mint(to, id);
    }

    function redeem(uint256 id) external {
        require(ownerOf(id) == msg.sender, "not owner");
        require(!redeemed[id], "already redeemed");
        redeemed[id] = true;
        _burn(id);
    }

    // Simple non-transferable implementation
    function transferFrom(address, address, uint256) public virtual override {
        revert("SBT: non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256) public virtual override {
        revert("SBT: non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert("SBT: non-transferable");
    }
}