// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WitnessStaking {
	mapping(address => uint256) public stakedBalanceByAddress;
	uint256 public totalStaked;

	event Staked(address indexed staker, uint256 amount);
	event Withdrawn(address indexed staker, uint256 amount);

	function stake() external payable {
		require(msg.value > 0, "Zero amount");
		stakedBalanceByAddress[msg.sender] += msg.value;
		totalStaked += msg.value;
		emit Staked(msg.sender, msg.value);
	}

	function withdraw(uint256 amount) external {
		require(amount > 0, "Zero amount");
		uint256 balance = stakedBalanceByAddress[msg.sender];
		require(balance >= amount, "Insufficient staked balance");
		stakedBalanceByAddress[msg.sender] = balance - amount;
		totalStaked -= amount;
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		require(success, "Withdraw failed");
		emit Withdrawn(msg.sender, amount);
	}
}