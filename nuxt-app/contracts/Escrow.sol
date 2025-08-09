// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public payer;
    address public payee;

    struct Milestone {
        uint256 amount;
        bool released;
    }

    Milestone[] public milestones;

    event Deposited(address indexed from, uint256 amount);
    event MilestoneConfirmed(uint256 indexed index);
    event FundsReleased(uint256 amount);

    constructor(address _payer, address _payee, uint256[] memory _amounts) {
        payer = _payer;
        payee = _payee;
        for (uint i = 0; i < _amounts.length; i++) {
            milestones.push(Milestone({ amount: _amounts[i], released: false }));
        }
    }

    function deposit() external payable {
        require(msg.sender == payer, 'only payer');
        emit Deposited(msg.sender, msg.value);
    }

    function confirmMilestone(uint index) external {
        require(msg.sender == payer, 'only payer');
        Milestone storage m = milestones[index];
        require(!m.released, 'already released');
        require(address(this).balance >= m.amount, 'insufficient');
        m.released = true;
        payable(payee).transfer(m.amount);
        emit MilestoneConfirmed(index);
        emit FundsReleased(m.amount);
    }

    function releaseFunds() external {
        require(msg.sender == payer, 'only payer');
        uint bal = address(this).balance;
        payable(payee).transfer(bal);
        emit FundsReleased(bal);
    }

    function balance() external view returns (uint) {
        return address(this).balance;
    }
}
