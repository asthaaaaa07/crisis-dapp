// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AidVoucher is ERC721Burnable, Ownable {
	uint256 private _tokenIdCounter;

	struct VoucherInfo {
		address redeemer;
		bool redeemed;
	}

	mapping(uint256 => VoucherInfo) public voucherInfoById;

	event VoucherMinted(uint256 indexed tokenId, address indexed redeemer);
	event VoucherRedeemed(uint256 indexed tokenId, address indexed redeemer);

	constructor() ERC721("AidVoucher", "AIDV") {}

	function mintVoucher(address redeemer) external onlyOwner returns (uint256) {
		require(redeemer != address(0), "Invalid redeemer");
		uint256 newTokenId = ++_tokenIdCounter;
		_safeMint(redeemer, newTokenId);
		voucherInfoById[newTokenId] = VoucherInfo({redeemer: redeemer, redeemed: false});
		emit VoucherMinted(newTokenId, redeemer);
		return newTokenId;
	}

	function redeem(uint256 tokenId) external {
		VoucherInfo storage info = voucherInfoById[tokenId];
		require(info.redeemer != address(0), "Voucher does not exist");
		require(msg.sender == info.redeemer, "Not authorized redeemer");
		require(ownerOf(tokenId) == msg.sender, "Caller must own voucher");
		require(!info.redeemed, "Already redeemed");
		info.redeemed = true;
		_burn(tokenId);
		emit VoucherRedeemed(tokenId, msg.sender);
	}
}