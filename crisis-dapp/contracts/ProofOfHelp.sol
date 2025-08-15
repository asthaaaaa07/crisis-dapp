// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ProofOfHelp is Ownable {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    struct HelpProof {
        uint256 id;
        address helper;
        address beneficiary;
        string helpType;
        string description;
        string location;
        string ipfsHash; // For evidence/documentation
        uint256 timestamp;
        uint256 value; // Value of help provided (in wei equivalent)
        bool verified;
        bool disputed;
        uint256 verificationCount;
        uint256 disputeCount;
        string status; // "pending", "verified", "disputed", "resolved"
    }

    struct Verification {
        uint256 proofId;
        address verifier;
        bool approved;
        string comment;
        uint256 timestamp;
    }

    struct Dispute {
        uint256 proofId;
        address disputer;
        string reason;
        uint256 timestamp;
        bool resolved;
        string resolution;
    }

    Counters.Counter private _proofIds;
    Counters.Counter private _verificationIds;
    Counters.Counter private _disputeIds;

    mapping(uint256 => HelpProof) public proofs;
    mapping(uint256 => Verification[]) public verifications;
    mapping(uint256 => Dispute[]) public disputes;
    mapping(address => uint256[]) public userProofs;
    mapping(address => uint256[]) public userVerifications;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => uint256) public verifierReputation;
    mapping(bytes32 => bool) public usedSignatures;

    uint256 public minVerificationsForProof = 3;
    uint256 public minDisputesForReview = 2;
    uint256 public verificationReward = 1 ether / 100; // 0.01 ETH
    uint256 public disputePenalty = 1 ether / 50; // 0.02 ETH

    event ProofSubmitted(uint256 indexed proofId, address indexed helper, string helpType);
    event ProofVerified(uint256 indexed proofId, address indexed verifier, bool approved);
    event ProofDisputed(uint256 indexed proofId, address indexed disputer, string reason);
    event ProofResolved(uint256 indexed proofId, string status);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Only authorized verifiers can call this");
        _;
    }

    modifier proofExists(uint256 proofId) {
        require(proofId > 0 && proofId <= _proofIds.current(), "Proof does not exist");
        _;
    }

    modifier proofNotVerified(uint256 proofId) {
        require(!proofs[proofId].verified, "Proof already verified");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
        authorizedVerifiers[msg.sender] = true;
    }

    function submitProof(
        address beneficiary,
        string memory helpType,
        string memory description,
        string memory location,
        string memory ipfsHash,
        uint256 value,
        bytes memory signature
    ) external returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary address");
        require(bytes(helpType).length > 0, "Help type cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(value > 0, "Value must be greater than 0");

        // Verify signature from beneficiary
        bytes32 messageHash = keccak256(abi.encodePacked(
            beneficiary,
            msg.sender,
            helpType,
            description,
            location,
            value,
            block.chainid
        ));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == beneficiary, "Invalid signature");
        require(!usedSignatures[messageHash], "Signature already used");

        usedSignatures[messageHash] = true;

        _proofIds.increment();
        uint256 proofId = _proofIds.current();

        proofs[proofId] = HelpProof({
            id: proofId,
            helper: msg.sender,
            beneficiary: beneficiary,
            helpType: helpType,
            description: description,
            location: location,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            value: value,
            verified: false,
            disputed: false,
            verificationCount: 0,
            disputeCount: 0,
            status: "pending"
        });

        userProofs[msg.sender].push(proofId);

        emit ProofSubmitted(proofId, msg.sender, helpType);
        return proofId;
    }

    function verifyProof(
        uint256 proofId,
        bool approved,
        string memory comment
    ) external onlyVerifier proofExists(proofId) proofNotVerified(proofId) {
        HelpProof storage proof = proofs[proofId];
        require(keccak256(bytes(proof.status)) == keccak256(bytes("pending")), "Proof not in pending status");

        _verificationIds.increment();
        Verification memory verification = Verification({
            proofId: proofId,
            verifier: msg.sender,
            approved: approved,
            comment: comment,
            timestamp: block.timestamp
        });

        verifications[proofId].push(verification);
        userVerifications[msg.sender].push(proofId);
        proof.verificationCount++;

        // Check if enough verifications for auto-approval
        if (proof.verificationCount >= minVerificationsForProof) {
            uint256 approvalCount = 0;
            for (uint256 i = 0; i < verifications[proofId].length; i++) {
                if (verifications[proofId][i].approved) {
                    approvalCount++;
                }
            }

            if (approvalCount > proof.verificationCount / 2) {
                proof.verified = true;
                proof.status = "verified";
                emit ProofResolved(proofId, "verified");
            }
        }

        emit ProofVerified(proofId, msg.sender, approved);
    }

    function disputeProof(
        uint256 proofId,
        string memory reason
    ) external proofExists(proofId) {
        HelpProof storage proof = proofs[proofId];
        require(keccak256(bytes(proof.status)) == keccak256(bytes("pending")), "Proof not in pending status");
        require(msg.sender != proof.helper, "Helper cannot dispute their own proof");

        _disputeIds.increment();
        Dispute memory dispute = Dispute({
            proofId: proofId,
            disputer: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            resolved: false,
            resolution: ""
        });

        disputes[proofId].push(dispute);
        proof.disputeCount++;
        proof.disputed = true;

        if (proof.disputeCount >= minDisputesForReview) {
            proof.status = "disputed";
        }

        emit ProofDisputed(proofId, msg.sender, reason);
    }

    function resolveDispute(
        uint256 proofId,
        bool approved,
        string memory resolution
    ) external onlyOwner proofExists(proofId) {
        HelpProof storage proof = proofs[proofId];
        require(proof.disputed, "Proof is not disputed");

        proof.status = approved ? "verified" : "resolved";
        proof.verified = approved;

        // Update all disputes for this proof as resolved
        for (uint256 i = 0; i < disputes[proofId].length; i++) {
            disputes[proofId][i].resolved = true;
            disputes[proofId][i].resolution = resolution;
        }

        emit ProofResolved(proofId, proof.status);
    }

    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid address");
        require(!authorizedVerifiers[verifier], "Already a verifier");
        
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    function removeVerifier(address verifier) external onlyOwner {
        require(authorizedVerifiers[verifier], "Not a verifier");
        authorizedVerifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    function getProof(uint256 proofId) 
        external 
        view 
        proofExists(proofId) 
        returns (HelpProof memory) 
    {
        return proofs[proofId];
    }

    function getVerifications(uint256 proofId) 
        external 
        view 
        proofExists(proofId) 
        returns (Verification[] memory) 
    {
        return verifications[proofId];
    }

    function getDisputes(uint256 proofId) 
        external 
        view 
        proofExists(proofId) 
        returns (Dispute[] memory) 
    {
        return disputes[proofId];
    }

    function getUserProofs(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userProofs[user];
    }

    function getUserVerifications(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userVerifications[user];
    }

    function getPendingProofs() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _proofIds.current(); i++) {
            if (keccak256(bytes(proofs[i].status)) == keccak256(bytes("pending"))) {
                count++;
            }
        }

        uint256[] memory pending = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _proofIds.current(); i++) {
            if (keccak256(bytes(proofs[i].status)) == keccak256(bytes("pending"))) {
                pending[index] = i;
                index++;
            }
        }
        return pending;
    }

    function getDisputedProofs() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _proofIds.current(); i++) {
            if (proofs[i].disputed) {
                count++;
            }
        }

        uint256[] memory disputed = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _proofIds.current(); i++) {
            if (proofs[i].disputed) {
                disputed[index] = i;
                index++;
            }
        }
        return disputed;
    }

    function setVerificationThresholds(
        uint256 minVerifications,
        uint256 minDisputes
    ) external onlyOwner {
        minVerificationsForProof = minVerifications;
        minDisputesForReview = minDisputes;
    }

    function setRewardsAndPenalties(
        uint256 verificationReward_,
        uint256 disputePenalty_
    ) external onlyOwner {
        verificationReward = verificationReward_;
        disputePenalty = disputePenalty_;
    }

    function isProofVerified(uint256 proofId) 
        external 
        view 
        proofExists(proofId) 
        returns (bool) 
    {
        return proofs[proofId].verified;
    }

    function getProofStatus(uint256 proofId) 
        external 
        view 
        proofExists(proofId) 
        returns (string memory) 
    {
        return proofs[proofId].status;
    }

    function getTotalProofs() external view returns (uint256) {
        return _proofIds.current();
    }

    function getTotalVerifications() external view returns (uint256) {
        return _verificationIds.current();
    }

    function getTotalDisputes() external view returns (uint256) {
        return _disputeIds.current();
    }
}