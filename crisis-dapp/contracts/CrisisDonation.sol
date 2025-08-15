// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CrisisDonation is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Crisis {
        uint256 id;
        string title;
        string description;
        string location;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        bool active;
        bool verified;
        address organizer;
        string ipfsHash;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
        bool anonymous;
    }

    Counters.Counter private _crisisIds;
    mapping(uint256 => Crisis) public crises;
    mapping(uint256 => Donation[]) public donations;
    mapping(address => uint256[]) public userDonations;
    mapping(address => uint256) public totalDonatedByUser;

    uint256 public platformFee = 2; // 2% platform fee
    uint256 public minDonation = 0.001 ether;
    uint256 public maxDonation = 100 ether;

    event CrisisCreated(uint256 indexed crisisId, string title, address organizer);
    event DonationMade(uint256 indexed crisisId, address indexed donor, uint256 amount);
    event CrisisVerified(uint256 indexed crisisId, bool verified);
    event CrisisClosed(uint256 indexed crisisId);
    event FundsWithdrawn(uint256 indexed crisisId, address organizer, uint256 amount);

    modifier crisisExists(uint256 crisisId) {
        require(crisisId > 0 && crisisId <= _crisisIds.current(), "Crisis does not exist");
        _;
    }

    modifier crisisActive(uint256 crisisId) {
        require(crises[crisisId].active, "Crisis is not active");
        _;
    }

    modifier onlyOrganizer(uint256 crisisId) {
        require(crises[crisisId].organizer == msg.sender, "Only organizer can call this");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
    }

    function createCrisis(
        string memory title,
        string memory description,
        string memory location,
        uint256 targetAmount,
        uint256 duration,
        string memory ipfsHash
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(targetAmount > 0, "Target amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        _crisisIds.increment();
        uint256 crisisId = _crisisIds.current();

        crises[crisisId] = Crisis({
            id: crisisId,
            title: title,
            description: description,
            location: location,
            targetAmount: targetAmount,
            raisedAmount: 0,
            deadline: block.timestamp + duration,
            active: true,
            verified: false,
            organizer: msg.sender,
            ipfsHash: ipfsHash
        });

        emit CrisisCreated(crisisId, title, msg.sender);
        return crisisId;
    }

    function donate(uint256 crisisId, string memory message, bool anonymous) 
        external 
        payable 
        nonReentrant 
        crisisExists(crisisId) 
        crisisActive(crisisId) 
    {
        require(msg.value >= minDonation, "Donation too small");
        require(msg.value <= maxDonation, "Donation too large");
        require(block.timestamp < crises[crisisId].deadline, "Crisis deadline passed");

        Crisis storage crisis = crises[crisisId];
        crisis.raisedAmount += msg.value;

        Donation memory newDonation = Donation({
            donor: anonymous ? address(0) : msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: message,
            anonymous: anonymous
        });

        donations[crisisId].push(newDonation);
        userDonations[msg.sender].push(crisisId);
        totalDonatedByUser[msg.sender] += msg.value;

        emit DonationMade(crisisId, msg.sender, msg.value);
    }

    function verifyCrisis(uint256 crisisId, bool verified) 
        external 
        onlyOwner 
        crisisExists(crisisId) 
    {
        crises[crisisId].verified = verified;
        emit CrisisVerified(crisisId, verified);
    }

    function closeCrisis(uint256 crisisId) 
        external 
        onlyOrganizer(crisisId) 
        crisisExists(crisisId) 
    {
        crises[crisisId].active = false;
        emit CrisisClosed(crisisId);
    }

    function withdrawFunds(uint256 crisisId) 
        external 
        nonReentrant 
        onlyOrganizer(crisisId) 
        crisisExists(crisisId) 
    {
        Crisis storage crisis = crises[crisisId];
        require(crisis.verified, "Crisis must be verified");
        require(crisis.raisedAmount > 0, "No funds to withdraw");

        uint256 withdrawAmount = crisis.raisedAmount;
        crisis.raisedAmount = 0;

        (bool success, ) = crisis.organizer.call{value: withdrawAmount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(crisisId, crisis.organizer, withdrawAmount);
    }

    function getCrisis(uint256 crisisId) 
        external 
        view 
        crisisExists(crisisId) 
        returns (Crisis memory) 
    {
        return crises[crisisId];
    }

    function getDonations(uint256 crisisId) 
        external 
        view 
        crisisExists(crisisId) 
        returns (Donation[] memory) 
    {
        return donations[crisisId];
    }

    function getUserDonations(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userDonations[user];
    }

    function getActiveCrises() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _crisisIds.current(); i++) {
            if (crises[i].active) {
                count++;
            }
        }

        uint256[] memory activeCrises = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _crisisIds.current(); i++) {
            if (crises[i].active) {
                activeCrises[index] = i;
                index++;
            }
        }
        return activeCrises;
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    function setDonationLimits(uint256 min, uint256 max) external onlyOwner {
        require(min < max, "Min must be less than max");
        minDonation = min;
        maxDonation = max;
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {
        revert("Direct donations not accepted");
    }
}
