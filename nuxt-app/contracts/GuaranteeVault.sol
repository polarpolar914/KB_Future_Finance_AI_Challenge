// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

/// @title GuaranteeVault - manages guarantor limits and locked funds backed by tokens
contract GuaranteeVault {
    IERC20 public immutable token;
    address public owner;

    mapping(address => uint256) public limits;
    mapping(uint256 => uint256) public locked;

    event GuaranteeLimitSet(address indexed account, uint256 limit);
    event Locked(uint256 indexed dealId, uint256 amount);
    event Unlocked(uint256 indexed dealId, uint256 amount, address to);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'only owner');
        _;
    }

    function setGuaranteeLimit(address account, uint256 limit) external onlyOwner {
        limits[account] = limit;
        emit GuaranteeLimitSet(account, limit);
    }

    /// @notice Locks `amount` of tokens from the caller for deal `dealId`
    function lock(uint256 dealId, uint256 amount) external {
        require(amount <= limits[msg.sender], 'limit exceeded');
        locked[dealId] += amount;
        limits[msg.sender] -= amount;
        require(token.transferFrom(msg.sender, address(this), amount), 'transfer failed');
        emit Locked(dealId, amount);
    }

    /// @notice Unlocks `amount` and transfers to `to`
    function unlock(uint256 dealId, uint256 amount, address to) external {
        require(locked[dealId] >= amount, 'not locked');
        locked[dealId] -= amount;
        limits[msg.sender] += amount;
        require(token.transfer(to, amount), 'transfer failed');
        emit Unlocked(dealId, amount, to);
    }
}
