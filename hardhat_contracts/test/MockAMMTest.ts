import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("MockAMM Tests", async function () {
  const { viem } = await network.connect();
  const [user] = await viem.getWalletClients();
  const userAddress = user.account.address;

  // Deploy mock tokens and AMM
  const dai = await viem.deployContract("MockDAI");
  const mkr = await viem.deployContract("MockMKR");
  const weth = await viem.deployContract("MockWETH");
  const mockAMM = await viem.deployContract("MockAMM");

  // Mint tokens for user
  const largeAmount = parseEther("1000000");
  await dai.write.mint([userAddress, largeAmount], { account: user.account });
  await mkr.write.mint([userAddress, largeAmount], { account: user.account });
  await weth.write.mint([userAddress, largeAmount], { account: user.account });

  // Helper function for sqrt
  function sqrt(x: bigint): bigint {
    let z = (x + 1n) / 2n;
    let y = x;
    while (z < y) {
      y = z;
      z = (x / z + z) / 2n;
    }
    return y;
  }

  /*//////////////////////////////////////////////////////////////
                       ADD LIQUIDITY TESTS
  //////////////////////////////////////////////////////////////*/
  describe("Add Liquidity", async function () {
    it("Should add liquidity for the first time", async function () {
      // Approve tokens
      await dai.write.approve([mockAMM.address, 2n ** 256n - 1n], {
        account: user.account,
      });

      const ethAmount = parseEther("100");
      const tokenAmount = parseEther("1000");

      const lpTokens = await mockAMM.write.addLiquidity(
        [dai.address, tokenAmount],
        { value: ethAmount, account: user.account }
      );

      const expectedLPTokens = sqrt(ethAmount * tokenAmount);
      assert.equal(lpTokens, expectedLPTokens);

      const pool = await mockAMM.read.getPool([dai.address]);
      assert.equal(pool.ethReserve, ethAmount);
      assert.equal(pool.tokenReserve, tokenAmount);
      assert.equal(pool.totalSupply, expectedLPTokens);
    });

    it("Should add liquidity subsequent times", async function () {
      const ethAmount1 = parseEther("100");
      const tokenAmount1 = parseEther("1000");
      const lpTokens1 = await mockAMM.write.addLiquidity(
        [dai.address, tokenAmount1],
        { value: ethAmount1, account: user.account }
      );

      const ethAmount2 = parseEther("50");
      const tokenAmount2 = parseEther("500");
      const lpTokens2 = await mockAMM.write.addLiquidity(
        [dai.address, tokenAmount2],
        { value: ethAmount2, account: user.account }
      );

      const expectedLPTokens2 = (ethAmount2 * lpTokens1) / ethAmount1;
      assert.equal(lpTokens2, expectedLPTokens2);

      const pool = await mockAMM.read.getPool([dai.address]);
      assert.equal(pool.ethReserve, ethAmount1 + ethAmount2);
      assert.equal(pool.tokenReserve, tokenAmount1 + tokenAmount2);
    });
  });

  /*//////////////////////////////////////////////////////////////
                       SWAP ETH FOR TOKENS TESTS
  //////////////////////////////////////////////////////////////*/
  describe("Swap ETH for Tokens", async function () {
    it("Should swap ETH for tokens", async function () {
      // First add liquidity
      await mkr.write.approve([mockAMM.address, 2n ** 256n - 1n], {
        account: user.account,
      });

      const ethAmount = parseEther("1000");
      const tokenAmount = parseEther("10000");
      await mockAMM.write.addLiquidity([mkr.address, tokenAmount], {
        value: ethAmount,
        account: user.account,
      });

      const swapAmount = parseEther("10");
      const expectedOutput = await mockAMM.read.getAmountOut([mkr.address, swapAmount]);
      const amountOut = await mockAMM.write.swapETHForTokens(
        [mkr.address, 0n],
        { value: swapAmount, account: user.account }
      );

      assert.equal(amountOut, expectedOutput);
      assert.ok(amountOut > 0n);

      const pool = await mockAMM.read.getPool([mkr.address]);
      assert.equal(pool.ethReserve, ethAmount + swapAmount);
      assert.equal(pool.tokenReserve, tokenAmount - amountOut);
    });
  });

  /*//////////////////////////////////////////////////////////////
                       GET AMOUNT OUT TESTS
  //////////////////////////////////////////////////////////////*/
  describe("Get Amount Out", async function () {
    it("Should calculate amount out correctly", async function () {
      await weth.write.approve([mockAMM.address, 2n ** 256n - 1n], {
        account: user.account,
      });

      const ethAmount = parseEther("1000");
      const tokenAmount = parseEther("10000");
      await mockAMM.write.addLiquidity([weth.address, tokenAmount], {
        value: ethAmount,
        account: user.account,
      });

      const swapEthAmount = parseEther("10");
      const amountOut = await mockAMM.read.getAmountOut([weth.address, swapEthAmount]);

      assert.ok(amountOut > 0n);
      assert.ok(amountOut < parseEther("10000"));
    });
  });
});

