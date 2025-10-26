import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("MockToken Tests", async function () {
  const { viem } = await network.connect();
  const [user, recipient] = await viem.getWalletClients();
  const userAddress = user.account.address;
  const recipientAddress = recipient.account.address;

  // Deploy mock tokens
  const dai = await viem.deployContract("MockDAI");
  const weth = await viem.deployContract("MockWETH");
  const mkr = await viem.deployContract("MockMKR");

  /*//////////////////////////////////////////////////////////////
                          MOCKDAI TESTS
  //////////////////////////////////////////////////////////////*/
  describe("MockDAI", async function () {
    it("Should have correct token metadata", async function () {
      assert.equal(await dai.read.name(), "DAI");
      assert.equal(await dai.read.symbol(), "DAI");
      assert.equal(await dai.read.decimals(), 18);
    });

    it("Should mint, transfer and burn tokens correctly", async function () {
      const mintAmount = parseEther("1000");
      
      // Mint tokens
      await dai.write.mint([userAddress, mintAmount], { account: user.account });
      assert.equal(await dai.read.balanceOf([userAddress]), mintAmount);

      // Transfer tokens
      const transferAmount = parseEther("500");
      await dai.write.transfer([recipientAddress, transferAmount], { account: user.account });
      assert.equal(await dai.read.balanceOf([userAddress]), parseEther("500"));
      assert.equal(await dai.read.balanceOf([recipientAddress]), transferAmount);

      // Burn tokens
      const burnAmount = parseEther("200");
      await dai.write.burn([userAddress, burnAmount], { account: user.account });
      assert.equal(await dai.read.balanceOf([userAddress]), parseEther("300"));
      assert.equal(await dai.read.totalSupply(), parseEther("800"));
    });
  });

  /*//////////////////////////////////////////////////////////////
                          MOCKWETH TESTS
  //////////////////////////////////////////////////////////////*/
  describe("MockWETH", async function () {
    it("Should have correct token metadata", async function () {
      assert.equal(await weth.read.name(), "Wrapped ETH");
      assert.equal(await weth.read.symbol(), "WETH");
      assert.equal(await weth.read.decimals(), 18);
    });

    it("Should mint, transfer and burn tokens correctly", async function () {
      const mintAmount = parseEther("5");
      
      // Mint tokens
      await weth.write.mint([userAddress, mintAmount], { account: user.account });
      assert.equal(await weth.read.balanceOf([userAddress]), mintAmount);

      // Transfer tokens
      const transferAmount = parseEther("2");
      await weth.write.transfer([recipientAddress, transferAmount], { account: user.account });
      assert.equal(await weth.read.balanceOf([userAddress]), parseEther("3"));
      assert.equal(await weth.read.balanceOf([recipientAddress]), transferAmount);

      // Burn tokens
      const burnAmount = parseEther("1");
      await weth.write.burn([userAddress, burnAmount], { account: user.account });
      assert.equal(await weth.read.balanceOf([userAddress]), parseEther("2"));
      assert.equal(await weth.read.totalSupply(), parseEther("4"));
    });
  });

  /*//////////////////////////////////////////////////////////////
                          MOCKMKR TESTS
  //////////////////////////////////////////////////////////////*/
  describe("MockMKR", async function () {
    it("Should have correct token metadata", async function () {
      assert.equal(await mkr.read.name(), "Maker");
      assert.equal(await mkr.read.symbol(), "MKR");
      assert.equal(await mkr.read.decimals(), 18);
    });

    it("Should mint, transfer and burn tokens correctly", async function () {
      const mintAmount = parseEther("5");
      
      // Mint tokens
      await mkr.write.mint([userAddress, mintAmount], { account: user.account });
      assert.equal(await mkr.read.balanceOf([userAddress]), mintAmount);

      // Transfer tokens
      const transferAmount = parseEther("2");
      await mkr.write.transfer([recipientAddress, transferAmount], { account: user.account });
      assert.equal(await mkr.read.balanceOf([userAddress]), parseEther("3"));
      assert.equal(await mkr.read.balanceOf([recipientAddress]), transferAmount);

      // Burn tokens
      const burnAmount = parseEther("1");
      await mkr.write.burn([userAddress, burnAmount], { account: user.account });
      assert.equal(await mkr.read.balanceOf([userAddress]), parseEther("2"));
      assert.equal(await mkr.read.totalSupply(), parseEther("4"));
    });
  });
});

