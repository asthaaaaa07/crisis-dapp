// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract IdentityManager is Ownable {
    using Counters for Counters.Counter;

    struct Identity {
        uint256 id;
        address wallet;
        string name;
        string email;
        string phone;
        string location;
        string ipfsHash; // For additional documents
        bool verified;
        bool active;
        uint256 reputation;
        uint256 verificationLevel;
        uint256 createdAt;
        uint256 lastUpdated;
    }

    struct VerificationRequest {
        uint256 id;
        address requester;
        string documentsHash;
        uint256 timestamp;
        bool processed;
        bool approved;
        string reason;
    }

    struct ReputationEvent {
        uint256 id;
        address user;
        string eventType;
        int256 points;
        string description;
        uint256 timestamp;
    }

    Counters.Counter private _identityIds;
    Counters.Counter private _verificationIds;
    Counters.Counter private _reputationEventIds;

    mapping(address => uint256) public addressToIdentityId;
    mapping(uint256 => Identity) public identities;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(address => ReputationEvent[]) public userReputationEvents;
    mapping(address => bool) public verifiers;
    mapping(address => uint256) public verifierReputation;

    uint256 public minReputationForVerifier = 100;
    uint256 public reputationForVerification = 10;
    uint256 public reputationForDonation = 5;
    uint256 public reputationForWitnessing = 15;

    event IdentityCreated(uint256 indexed identityId, address indexed wallet, string name);
    event IdentityVerified(uint256 indexed identityId, address indexed wallet, bool verified);
    event VerificationRequested(uint256 indexed requestId, address indexed requester);
    event ReputationUpdated(address indexed user, int256 points, string reason);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only verifiers can call this");
        _;
    }

    modifier identityExists(address wallet) {
        require(addressToIdentityId[wallet] > 0, "Identity does not exist");
        _;
    }

    modifier identityNotExists(address wallet) {
        require(addressToIdentityId[wallet] == 0, "Identity already exists");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
        verifiers[msg.sender] = true;
    }

    function createIdentity(
        string memory name,
        string memory email,
        string memory phone,
        string memory location,
        string memory ipfsHash
    ) external identityNotExists(msg.sender) returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(email).length > 0, "Email cannot be empty");

        _identityIds.increment();
        uint256 identityId = _identityIds.current();

        identities[identityId] = Identity({
            id: identityId,
            wallet: msg.sender,
            name: name,
            email: email,
            phone: phone,
            location: location,
            ipfsHash: ipfsHash,
            verified: false,
            active: true,
            reputation: 0,
            verificationLevel: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });

        addressToIdentityId[msg.sender] = identityId;

        emit IdentityCreated(identityId, msg.sender, name);
        return identityId;
    }

    function requestVerification(string memory documentsHash) 
        external 
        identityExists(msg.sender) 
        returns (uint256) 
    {
        require(bytes(documentsHash).length > 0, "Documents hash cannot be empty");

        _verificationIds.increment();
        uint256 requestId = _verificationIds.current();

        verificationRequests[requestId] = VerificationRequest({
            id: requestId,
            requester: msg.sender,
            documentsHash: documentsHash,
            timestamp: block.timestamp,
            processed: false,
            approved: false,
            reason: ""
        });

        emit VerificationRequested(requestId, msg.sender);
        return requestId;
    }

    function processVerification(
        uint256 requestId, 
        bool approved, 
        string memory reason
    ) external onlyVerifier {
        require(requestId > 0 && requestId <= _verificationIds.current(), "Invalid request ID");
        
        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.processed, "Request already processed");

        request.processed = true;
        request.approved = approved;
        request.reason = reason;

        if (approved) {
            uint256 identityId = addressToIdentityId[request.requester];
            identities[identityId].verified = true;
            identities[identityId].verificationLevel = 1;
            identities[identityId].lastUpdated = block.timestamp;

            _addReputationEvent(request.requester, "verification_approved", int256(reputationForVerification), "Identity verification approved");
            
            emit IdentityVerified(identityId, request.requester, true);
        }
    }

    function updateIdentity(
        string memory name,
        string memory email,
        string memory phone,
        string memory location,
        string memory ipfsHash
    ) external identityExists(msg.sender) {
        uint256 identityId = addressToIdentityId[msg.sender];
        Identity storage identity = identities[identityId];

        if (bytes(name).length > 0) identity.name = name;
        if (bytes(email).length > 0) identity.email = email;
        if (bytes(phone).length > 0) identity.phone = phone;
        if (bytes(location).length > 0) identity.location = location;
        if (bytes(ipfsHash).length > 0) identity.ipfsHash = ipfsHash;

        identity.lastUpdated = block.timestamp;
    }

    function addReputation(address user, int256 points, string memory reason) 
        external 
        onlyVerifier 
        identityExists(user) 
    {
        _addReputationEvent(user, "manual_adjustment", points, reason);
    }

    function addDonationReputation(address user) external {
        require(msg.sender == owner() || verifiers[msg.sender], "Not authorized");
        _addReputationEvent(user, "donation", int256(reputationForDonation), "Made a donation");
    }

    function addWitnessReputation(address user) external {
        require(msg.sender == owner() || verifiers[msg.sender], "Not authorized");
        _addReputationEvent(user, "witnessing", int256(reputationForWitnessing), "Provided witness testimony");
    }

    function _addReputationEvent(
        address user, 
        string memory eventType, 
        int256 points, 
        string memory reason
    ) internal {
        uint256 identityId = addressToIdentityId[user];
        identities[identityId].reputation += uint256(int256(points));
        identities[identityId].lastUpdated = block.timestamp;

        _reputationEventIds.increment();
        ReputationEvent memory event_ = ReputationEvent({
            id: _reputationEventIds.current(),
            user: user,
            eventType: eventType,
            points: points,
            description: reason,
            timestamp: block.timestamp
        });

        userReputationEvents[user].push(event_);

        emit ReputationUpdated(user, points, reason);
    }

    function addVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid address");
        require(!verifiers[newVerifier], "Already a verifier");
        
        uint256 identityId = addressToIdentityId[newVerifier];
        require(identityId > 0, "Identity must exist");
        require(identities[identityId].reputation >= minReputationForVerifier, "Insufficient reputation");

        verifiers[newVerifier] = true;
        emit VerifierAdded(newVerifier);
    }

    function removeVerifier(address verifier) external onlyOwner {
        require(verifiers[verifier], "Not a verifier");
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    function getIdentity(address wallet) 
        external 
        view 
        identityExists(wallet) 
        returns (Identity memory) 
    {
        return identities[addressToIdentityId[wallet]];
    }

    function getVerificationRequest(uint256 requestId) 
        external 
        view 
        returns (VerificationRequest memory) 
    {
        require(requestId > 0 && requestId <= _verificationIds.current(), "Invalid request ID");
        return verificationRequests[requestId];
    }

    function getUserReputationEvents(address user) 
        external 
        view 
        returns (ReputationEvent[] memory) 
    {
        return userReputationEvents[user];
    }

    function getPendingVerifications() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _verificationIds.current(); i++) {
            if (!verificationRequests[i].processed) {
                count++;
            }
        }

        uint256[] memory pending = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _verificationIds.current(); i++) {
            if (!verificationRequests[i].processed) {
                pending[index] = i;
                index++;
            }
        }
        return pending;
    }

    function setReputationThresholds(
        uint256 minReputation,
        uint256 verificationRep,
        uint256 donationRep,
        uint256 witnessingRep
    ) external onlyOwner {
        minReputationForVerifier = minReputation;
        reputationForVerification = verificationRep;
        reputationForDonation = donationRep;
        reputationForWitnessing = witnessingRep;
    }

    function isVerified(address wallet) external view returns (bool) {
        uint256 identityId = addressToIdentityId[wallet];
        if (identityId == 0) return false;
        return identities[identityId].verified;
    }

    function getReputation(address wallet) external view returns (uint256) {
        uint256 identityId = addressToIdentityId[wallet];
        if (identityId == 0) return 0;
        return identities[identityId].reputation;
    }
}
