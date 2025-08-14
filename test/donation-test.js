const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationVault", function () {
  let Donation, donation, owner, addr1;

  beforeEach(async () => {
    Donation = await ethers.getContractFactory("DonationVault");
    [owner, addr1] = await ethers.getSigners();
    donation = await Donation.deploy();
    await donation.deployed();
  });

  it("accepts donations and emits event", async () => {
    const proof = ethers.utils.formatBytes32String("proof1");
    await expect(() => addr1.sendTransaction({ to: donation.address, value: ethers.utils.parseEther("0.01"), data: proof }))
      .to.changeEtherBalance(addr1, ethers.utils.parseEther("-0.01"));
    // Call donate via contract
    await expect(donation.connect(addr1).donate(proof, { value: ethers.utils.parseEther("0.01") }))
      .to.emit(donation, "Donated")
      .withArgs(addr1.address, ethers.utils.parseEther("0.01"), proof);
  });

  it("allows owner to withdraw", async () => {
    const proof = ethers.utils.formatBytes32String("proof2");
    await donation.connect(addr1).donate(proof, { value: ethers.utils.parseEther("0.02") });
    const initial = await ethers.provider.getBalance(owner.address);
    await donation.connect(owner).withdraw(owner.address, ethers.utils.parseEther("0.02"));
    const finalBal = await ethers.provider.getBalance(owner.address);
    expect(finalBal).to.be.gt(initial);
  });
});
