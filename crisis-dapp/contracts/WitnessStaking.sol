// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FactSBT is ERC721 {
    uint256 public nextId;
    constructor() ERC721("FactSBT", "FSBT") {}

    function mint(address to) external returns (uint256 id) {
        id = ++nextId;
        _mint(to, id);
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

contract WitnessStaking {
    struct Report {
        address reporter;
        string cid;
        uint256 stakeTotal;
        uint256 confirmations;
        bool finalized;
        bool valid;
    }
    
    uint256 public reportCount;
    mapping(uint256 => Report) public reports;
    mapping(uint256 => mapping(address => uint256)) public stakes;
    address public owner;
    FactSBT public factSBT;

    event ReportSubmitted(uint256 id, address reporter, string cid);
    event Staked(uint256 id, address staker, uint256 amount);
    event Finalized(uint256 id, bool valid);

    constructor(address _factSBT) {
        owner = msg.sender;
        factSBT = FactSBT(_factSBT);
    }

    function submitReport(string calldata cid) external returns (uint256 id) {
        id = ++reportCount;
        reports[id] = Report(msg.sender, cid, 0, 0, false, false);
        emit ReportSubmitted(id, msg.sender, cid);
    }

    function stakeOnReport(uint256 id) external payable {
        require(id > 0 && id <= reportCount, "invalid");
        require(!reports[id].finalized, "finalized");
        stakes[id][msg.sender] += msg.value;
        reports[id].stakeTotal += msg.value;
        emit Staked(id, msg.sender, msg.value);
    }

    function finalizeReport(uint256 id, bool valid) external {
        require(msg.sender == owner, "only owner in mock");
        Report storage r = reports[id];
        require(!r.finalized, "already");
        r.finalized = true;
        r.valid = valid;
        if (valid) {
            factSBT.mint(r.reporter);
        }
        emit Finalized(id, valid);
    }
}