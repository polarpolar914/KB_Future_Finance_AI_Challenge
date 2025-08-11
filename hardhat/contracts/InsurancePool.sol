// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InsurancePool {
    struct Deal {
        address insured;
        uint256 premium;
    }

    mapping(uint256 => Deal) public deals;

    event DealRegistered(uint256 indexed dealId, address insured, uint256 premium);
    event PayoutTriggered(uint256 indexed dealId, address to, uint256 amount);

    function registerDeal(uint256 dealId, address insured, uint256 premium) external {
        deals[dealId] = Deal(insured, premium);
        emit DealRegistered(dealId, insured, premium);
    }

    function triggerPayout(uint256 dealId, address to, uint256 amount) external {
        require(deals[dealId].insured != address(0), 'unknown deal');
        emit PayoutTriggered(dealId, to, amount);
    }
}
