// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

/// @title InsurancePool - collects premiums and pays out claims
contract InsurancePool {
    IERC20 public immutable token;

    struct Deal {
        address insured;
        uint256 premium;
    }

    mapping(uint256 => Deal) public deals;

    event DealRegistered(uint256 indexed dealId, address insured, uint256 premium);
    event PoolFunded(address indexed from, uint256 amount);
    event PayoutTriggered(uint256 indexed dealId, address to, uint256 amount);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    /// @notice Deposit additional funds to the pool
    function fundPool(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), 'transfer failed');
        emit PoolFunded(msg.sender, amount);
    }

    /// @notice Register a new deal and collect premium
    function registerDeal(uint256 dealId, uint256 premium) external {
        deals[dealId] = Deal(msg.sender, premium);
        require(token.transferFrom(msg.sender, address(this), premium), 'transfer failed');
        emit DealRegistered(dealId, msg.sender, premium);
    }

    /// @notice Pay out a claim from the pool
    function triggerPayout(uint256 dealId, address to, uint256 amount) external {
        require(deals[dealId].insured != address(0), 'unknown deal');
        require(token.balanceOf(address(this)) >= amount, 'insufficient pool');
        require(token.transfer(to, amount), 'transfer failed');
        emit PayoutTriggered(dealId, to, amount);
    }
}
