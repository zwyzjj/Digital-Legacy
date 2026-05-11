// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/Legacy.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        Legacy legacy = new Legacy();
        console2.log("Legacy deployed at:", address(legacy));
        vm.stopBroadcast();
    }
}
