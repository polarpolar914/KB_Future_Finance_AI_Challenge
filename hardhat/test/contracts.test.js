const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  it("handles deposit and milestone payout", async function () {
    const [payer, payee, insurer] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(1, payer.address, payee.address, insurer.address, [ethers.parseEther("1")]);
    await escrow.waitForDeployment();
    await expect(escrow.connect(payer).deposit({ value: ethers.parseEther("1") }))
      .to.emit(escrow, "Deposit").withArgs(payer.address, ethers.parseEther("1"));
    await expect(escrow.connect(payer).confirmMilestone(0))
      .to.emit(escrow, "Payout").withArgs(ethers.parseEther("1"));
  });
});

describe("ClaimNFT", function () {
  it("issues certificates and emits event", async function () {
    const [addr] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("ClaimNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    await expect(nft.issueCertificate(addr.address, 1, 100, "uri"))
      .to.emit(nft, "NFTIssued").withArgs(1, 1, 100);
  });
});

describe("GuaranteeVault", function () {
  it("restricts limit setting to owner", async function () {
    const [owner, other] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("GuaranteeVault");
    const vault = await Vault.deploy(ethers.ZeroAddress);
    await vault.waitForDeployment();
    await expect(vault.connect(other).setGuaranteeLimit(other.address, 100)).to.be.revertedWith("only owner");
    await expect(vault.setGuaranteeLimit(other.address, 100))
      .to.emit(vault, "GuaranteeLimitSet").withArgs(other.address, 100);
  });
});
