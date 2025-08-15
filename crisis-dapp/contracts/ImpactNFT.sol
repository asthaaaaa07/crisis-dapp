// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ImpactNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct ImpactAchievement {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 points;
        string imageURI;
        bool active;
        uint256 maxMints;
        uint256 currentMints;
    }

    struct UserImpact {
        uint256 totalPoints;
        uint256 totalNFTs;
        uint256[] ownedNFTs;
        mapping(string => uint256) categoryPoints;
    }

    Counters.Counter private _tokenIds;
    Counters.Counter private _achievementIds;

    mapping(uint256 => ImpactAchievement) public achievements;
    mapping(uint256 => uint256) public tokenToAchievement;
    mapping(address => UserImpact) public userImpacts;
    mapping(address => mapping(uint256 => bool)) public userHasAchievement;
    mapping(string => uint256[]) public categoryAchievements;

    uint256 public minPointsForNFT = 10;
    uint256 public maxPointsPerAchievement = 100;

    event AchievementCreated(uint256 indexed achievementId, string title, string category);
    event NFTMinted(uint256 indexed tokenId, address indexed recipient, uint256 achievementId);
    event PointsAwarded(address indexed user, uint256 points, string category);
    event AchievementUpdated(uint256 indexed achievementId, bool active);

    modifier achievementExists(uint256 achievementId) {
        require(achievementId > 0 && achievementId <= _achievementIds.current(), "Achievement does not exist");
        _;
    }

    modifier achievementActive(uint256 achievementId) {
        require(achievements[achievementId].active, "Achievement is not active");
        _;
    }

    constructor() ERC721("ImpactNFT", "IMPACT") {
        _transferOwnership(msg.sender);
    }

    function createAchievement(
        string memory title,
        string memory description,
        string memory category,
        uint256 points,
        string memory imageURI,
        uint256 maxMints
    ) external onlyOwner returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");
        require(points > 0 && points <= maxPointsPerAchievement, "Invalid points");
        require(maxMints > 0, "Max mints must be greater than 0");

        _achievementIds.increment();
        uint256 achievementId = _achievementIds.current();

        achievements[achievementId] = ImpactAchievement({
            id: achievementId,
            title: title,
            description: description,
            category: category,
            points: points,
            imageURI: imageURI,
            active: true,
            maxMints: maxMints,
            currentMints: 0
        });

        categoryAchievements[category].push(achievementId);

        emit AchievementCreated(achievementId, title, category);
        return achievementId;
    }

    function mintImpactNFT(uint256 achievementId) 
        external 
        achievementExists(achievementId) 
        achievementActive(achievementId) 
        returns (uint256) 
    {
        ImpactAchievement storage achievement = achievements[achievementId];
        require(achievement.currentMints < achievement.maxMints, "Max mints reached");
        require(!userHasAchievement[msg.sender][achievementId], "Already has this achievement");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, achievement.imageURI);

        tokenToAchievement[tokenId] = achievementId;
        achievement.currentMints++;

        UserImpact storage userImpact = userImpacts[msg.sender];
        userImpact.totalPoints += achievement.points;
        userImpact.totalNFTs++;
        userImpact.ownedNFTs.push(tokenId);
        userImpact.categoryPoints[achievement.category] += achievement.points;
        userHasAchievement[msg.sender][achievementId] = true;

        emit NFTMinted(tokenId, msg.sender, achievementId);
        emit PointsAwarded(msg.sender, achievement.points, achievement.category);

        return tokenId;
    }

    function awardPoints(
        address user, 
        uint256 points, 
        string memory category
    ) external onlyOwner {
        require(points > 0, "Points must be greater than 0");
        require(bytes(category).length > 0, "Category cannot be empty");

        UserImpact storage userImpact = userImpacts[user];
        userImpact.totalPoints += points;
        userImpact.categoryPoints[category] += points;

        emit PointsAwarded(user, points, category);
    }

    function batchMintForAchievement(
        address[] memory recipients,
        uint256 achievementId
    ) external onlyOwner achievementExists(achievementId) achievementActive(achievementId) {
        ImpactAchievement storage achievement = achievements[achievementId];
        require(achievement.currentMints + recipients.length <= achievement.maxMints, "Would exceed max mints");

        for (uint256 i = 0; i < recipients.length; i++) {
            if (!userHasAchievement[recipients[i]][achievementId]) {
                _tokenIds.increment();
                uint256 tokenId = _tokenIds.current();

                _mint(recipients[i], tokenId);
                _setTokenURI(tokenId, achievement.imageURI);

                tokenToAchievement[tokenId] = achievementId;
                achievement.currentMints++;

                UserImpact storage userImpact = userImpacts[recipients[i]];
                userImpact.totalPoints += achievement.points;
                userImpact.totalNFTs++;
                userImpact.ownedNFTs.push(tokenId);
                userImpact.categoryPoints[achievement.category] += achievement.points;
                userHasAchievement[recipients[i]][achievementId] = true;

                emit NFTMinted(tokenId, recipients[i], achievementId);
                emit PointsAwarded(recipients[i], achievement.points, achievement.category);
            }
        }
    }

    function updateAchievement(
        uint256 achievementId,
        bool active
    ) external onlyOwner achievementExists(achievementId) {
        achievements[achievementId].active = active;
        emit AchievementUpdated(achievementId, active);
    }

    function getAchievement(uint256 achievementId) 
        external 
        view 
        achievementExists(achievementId) 
        returns (ImpactAchievement memory) 
    {
        return achievements[achievementId];
    }

    function getUserImpact(address user) 
        external 
        view 
        returns (
            uint256 totalPoints,
            uint256 totalNFTs,
            uint256[] memory ownedNFTs
        ) 
    {
        UserImpact storage userImpact = userImpacts[user];
        return (userImpact.totalPoints, userImpact.totalNFTs, userImpact.ownedNFTs);
    }

    function getUserCategoryPoints(address user, string memory category) 
        external 
        view 
        returns (uint256) 
    {
        return userImpacts[user].categoryPoints[category];
    }

    function getCategoryAchievements(string memory category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return categoryAchievements[category];
    }

    function getTokenAchievement(uint256 tokenId) 
        external 
        view 
        returns (uint256) 
    {
        require(_exists(tokenId), "Token does not exist");
        return tokenToAchievement[tokenId];
    }

    function hasAchievement(address user, uint256 achievementId) 
        external 
        view 
        returns (bool) 
    {
        return userHasAchievement[user][achievementId];
    }

    function getAvailableAchievements(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= _achievementIds.current(); i++) {
            if (achievements[i].active && 
                !userHasAchievement[user][i] && 
                achievements[i].currentMints < achievements[i].maxMints) {
                count++;
            }
        }

        uint256[] memory available = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _achievementIds.current(); i++) {
            if (achievements[i].active && 
                !userHasAchievement[user][i] && 
                achievements[i].currentMints < achievements[i].maxMints) {
                available[index] = i;
                index++;
            }
        }
        return available;
    }

    function setMinPointsForNFT(uint256 minPoints) external onlyOwner {
        minPointsForNFT = minPoints;
    }

    function setMaxPointsPerAchievement(uint256 maxPoints) external onlyOwner {
        maxPointsPerAchievement = maxPoints;
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}