// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public payer;
    address public payee;
    address public insurer;
    uint256 public dealId;

    struct Milestone {
        uint256 amount;
        bool released;
    }

    Milestone[] public milestones;
    bool public cancelled;
    bool public defaultDeclared;

    event Deposited(address indexed from, uint256 amount);
    event MilestoneConfirmed(uint256 indexed index);
    event FundsReleased(uint256 amount);
    event DealCancelled(uint256 indexed dealId, address indexed by);
    event DefaultDeclared(uint256 indexed dealId, address indexed by);
    event ClaimIssued(uint256 indexed dealId, address indexed by);

    constructor(
        uint256 _dealId,
        address _payer,
        address _payee,
        address _insurer,
        uint256[] memory _amounts
    ) {
        dealId = _dealId;
        payer = _payer;
        payee = _payee;
        insurer = _insurer;
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
        require(!cancelled && !defaultDeclared, 'deal ended');
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
        require(!cancelled && !defaultDeclared, 'deal ended');
        uint bal = address(this).balance;
        payable(payee).transfer(bal);
        emit FundsReleased(bal);
    }

    function balance() external view returns (uint) {
        return address(this).balance;
    }

    /// @notice Cancels the deal and refunds remaining balance to the payer
    function cancelDeal() external {
        require(msg.sender == payer || msg.sender == payee, 'only parties');
        require(!cancelled && !defaultDeclared, 'deal ended');
        cancelled = true;
        uint bal = address(this).balance;
        if (bal > 0) {
            payable(payer).transfer(bal);
            emit FundsReleased(bal);
        }
        emit DealCancelled(dealId, msg.sender);
        emit ClaimIssued(dealId, msg.sender);
    }

    /// @notice Declare default and trigger insurance claim event
    function declareDefault() external {
        require(msg.sender == payer || msg.sender == payee, 'only parties');
        require(!cancelled && !defaultDeclared, 'deal ended');
        defaultDeclared = true;
        emit DefaultDeclared(dealId, msg.sender);
        emit ClaimIssued(dealId, msg.sender);
    }
}
