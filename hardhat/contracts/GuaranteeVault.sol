// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GuaranteeVault {
    mapping(address => uint256) public limits;
    mapping(uint256 => uint256) public locked;

    event GuaranteeLimitSet(address indexed account, uint256 limit);
    event Locked(uint256 indexed dealId, uint256 amount);
    event Unlocked(uint256 indexed dealId, uint256 amount);

    function setGuaranteeLimit(address account, uint256 limit) external {
        limits[account] = limit;
        emit GuaranteeLimitSet(account, limit);
    }

    function lock(uint256 dealId, uint256 amount) external {
        require(amount <= limits[msg.sender], 'limit exceeded');
        locked[dealId] += amount;
        limits[msg.sender] -= amount;
        emit Locked(dealId, amount);
    }

    function unlock(uint256 dealId, uint256 amount) external {
        require(locked[dealId] >= amount, 'not locked');
        locked[dealId] -= amount;
        limits[msg.sender] += amount;
        emit Unlocked(dealId, amount);
    }
}
