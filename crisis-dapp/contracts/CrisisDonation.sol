// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrisisDonation {
    address public owner;

    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Donation[] public donations;

    event Donated(address indexed donor, uint256 amount, string message);

    constructor() {
        owner = msg.sender;
    }

    function donate(string memory _message) public payable {
        require(msg.value > 0, "Must send ETH");

        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));

        emit Donated(msg.sender, msg.value, _message);
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
