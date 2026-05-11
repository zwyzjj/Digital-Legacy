// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Digital Legacy - Dead-man's switch on 0G Galileo
/// @notice User deposits funds; beneficiary can claim after inactivityPeriod without ping.
contract Legacy {
    struct Vault {
        address owner;
        address beneficiary;
        uint256 amount;
        uint256 lastPing;
        uint256 inactivityPeriod;
        bool claimed;
    }

    uint256 public nextId;
    mapping(uint256 => Vault) public vaults;

    event VaultCreated(
        uint256 indexed id,
        address indexed owner,
        address indexed beneficiary,
        uint256 amount,
        uint256 inactivityPeriod
    );
    event Pinged(uint256 indexed id, uint256 timestamp);
    event Claimed(uint256 indexed id, address indexed beneficiary, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    error NotOwner();
    error NotBeneficiary();
    error StillActive();
    error AlreadyClaimed();
    error ZeroAmount();
    error ZeroAddress();

    function createVault(address beneficiary, uint256 inactivityPeriod) external payable returns (uint256 id) {
        if (msg.value == 0) revert ZeroAmount();
        if (beneficiary == address(0)) revert ZeroAddress();

        id = nextId++;
        vaults[id] = Vault({
            owner: msg.sender,
            beneficiary: beneficiary,
            amount: msg.value,
            lastPing: block.timestamp,
            inactivityPeriod: inactivityPeriod,
            claimed: false
        });

        emit VaultCreated(id, msg.sender, beneficiary, msg.value, inactivityPeriod);
    }

    function ping(uint256 id) external {
        Vault storage v = vaults[id];
        if (msg.sender != v.owner) revert NotOwner();
        if (v.claimed) revert AlreadyClaimed();
        v.lastPing = block.timestamp;
        emit Pinged(id, block.timestamp);
    }

    function claim(uint256 id) external {
        Vault storage v = vaults[id];
        if (msg.sender != v.beneficiary) revert NotBeneficiary();
        if (v.claimed) revert AlreadyClaimed();
        if (block.timestamp < v.lastPing + v.inactivityPeriod) revert StillActive();

        v.claimed = true;
        uint256 amount = v.amount;
        v.amount = 0;
        (bool ok,) = v.beneficiary.call{value: amount}("");
        require(ok, "transfer failed");
        emit Claimed(id, v.beneficiary, amount);
    }

    function withdraw(uint256 id) external {
        Vault storage v = vaults[id];
        if (msg.sender != v.owner) revert NotOwner();
        if (v.claimed) revert AlreadyClaimed();

        v.claimed = true;
        uint256 amount = v.amount;
        v.amount = 0;
        (bool ok,) = v.owner.call{value: amount}("");
        require(ok, "transfer failed");
        emit Withdrawn(id, v.owner, amount);
    }
}
