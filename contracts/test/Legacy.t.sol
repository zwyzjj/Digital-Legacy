// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Legacy.sol";

contract LegacyTest is Test {
    Legacy legacy;
    address owner = address(0xA11CE);
    address beneficiary = address(0xB0B);

    function setUp() public {
        legacy = new Legacy();
        vm.deal(owner, 10 ether);
    }

    function testCreateAndClaim() public {
        vm.prank(owner);
        uint256 id = legacy.createVault{value: 1 ether}(beneficiary, 60);

        vm.prank(owner);
        legacy.ping(id);

        vm.warp(block.timestamp + 61);
        uint256 beforeBal = beneficiary.balance;

        vm.prank(beneficiary);
        legacy.claim(id);
        assertEq(beneficiary.balance, beforeBal + 1 ether);
    }

    function testCannotClaimIfAlive() public {
        vm.prank(owner);
        uint256 id = legacy.createVault{value: 1 ether}(beneficiary, 60);

        vm.prank(beneficiary);
        vm.expectRevert(Legacy.StillActive.selector);
        legacy.claim(id);
    }

    function testOnlyBeneficiaryCanClaim() public {
        vm.prank(owner);
        uint256 id = legacy.createVault{value: 1 ether}(beneficiary, 60);

        vm.warp(block.timestamp + 61);

        address randomDude = address(0xDEAD);
        vm.prank(randomDude);
        vm.expectRevert(Legacy.NotBeneficiary.selector);
        legacy.claim(id);
    }
}
