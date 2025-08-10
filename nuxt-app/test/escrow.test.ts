import { ethers } from "hardhat";
import { expect } from "chai";

describe("Escrow", function () {
  it("allows the payer to deposit and release milestone funds", async function () {
    const [payer, payee] = await ethers.getSigners();
    const amounts = [ethers.parseEther("1")];
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(payer.address, payee.address, amounts);
    await escrow.waitForDeployment();

    await escrow.connect(payer).deposit({ value: amounts[0] });
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(amounts[0]);

    const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);
    await (await escrow.connect(payer).confirmMilestone(0)).wait();
    const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
    expect(payeeBalanceAfter).to.equal(payeeBalanceBefore + amounts[0]);
  });
});
