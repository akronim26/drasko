import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, parseUnits, keccak256, encodePacked, encode } from "viem";
import { type Hash } from "viem";
import { privateKeyToAddress, signTypedData } from "viem/accounts";

describe("Agent Tests", async function () {
  const { viem } = await network.connect();
  const [owner] = await viem.getWalletClients();
  const ownerAddress = owner.account.address;

  // Signer for authorized trades
  const signerPrivateKey = "0xa11ce"; // Using same key as Foundry tests
  const authorizedSigner = privateKeyToAddress(signerPrivateKey as Hash);

  // Deploy all contracts
  const dai = await viem.deployContract("MockDAI");
  const weth = await viem.deployContract("MockWETH");
  const mkr = await viem.deployContract("MockMKR");
  const mockAMM = await viem.deployContract("MockAMM");
  const factory = await viem.deployContract("AgentFactory");

  // Deploy agent
  const tokenArray = [dai.address, weth.address, mkr.address];
  const Platform = {
    Twitter: 0,
    Telegram: 1,
    Discord: 2,
  };

  const agent = await factory.write.createAgent(
    [tokenArray, Platform.Twitter, authorizedSigner, mockAMM.address],
    { value: parseEther("1"), account: owner.account }
  );

  // Setup liquidity
  const liquidityAmount = parseEther("100000");
  await dai.write.mint([agent.address, liquidityAmount], { account: owner.account });
  await mkr.write.mint([agent.address, liquidityAmount], { account: owner.account });
  await weth.write.mint([agent.address, liquidityAmount], { account: owner.account });

  // Transfer ETH for liquidity
  const ethValue = liquidityAmount * 3n;
  await owner.client.sendTransaction({
    to: agent.address,
    value: ethValue,
    account: owner.account,
  });

  await agent.write.setupPoolsAndLiquidity([tokenArray, liquidityAmount], {
    account: owner.account,
  });

  // Add funds to agent
  await agent.write.addFunds({ value: parseEther("1000"), account: owner.account });

  // Mint tokens for owner
  const initialBalance = parseEther("1000000");
  await dai.write.mint([ownerAddress, initialBalance], { account: owner.account });
  await weth.write.mint([ownerAddress, initialBalance], { account: owner.account });
  await mkr.write.mint([ownerAddress, initialBalance], { account: owner.account });

  /*//////////////////////////////////////////////////////////////
                   AGENT FACTORY FUNCTIONS
  //////////////////////////////////////////////////////////////*/
  describe("AgentFactory", async function () {
    it("Should create agent with correct information", async function () {
      const agentInfo = await factory.read.getAgentInfo([ownerAddress, 0n]);
      
      assert.equal(agentInfo.agentAddress.toLowerCase(), agent.address.toLowerCase());
      assert.equal(agentInfo.owner.toLowerCase(), ownerAddress.toLowerCase());
      assert.equal(agentInfo.tokens.length, 3);
      assert.equal(agentInfo.tokens[0].toLowerCase(), dai.address.toLowerCase());
      assert.equal(agentInfo.tokens[1].toLowerCase(), weth.address.toLowerCase());
      assert.equal(agentInfo.tokens[2].toLowerCase(), mkr.address.toLowerCase());
      assert.equal(agentInfo.amountInvested, parseEther("1"));
      assert.equal(agentInfo.platformType, Platform.Twitter);
    });
  });

  /*//////////////////////////////////////////////////////////////
                       AGENT FUNCTIONS
  //////////////////////////////////////////////////////////////*/
  describe("Agent", async function () {
    it("Should pause and resume agent", async function () {
      // Pause agent
      await agent.write.pauseAgent({ account: owner.account });
      assert.equal(await agent.read.getPausedState(), true);

      // Resume agent
      await agent.write.resumeAgent({ account: owner.account });
      assert.equal(await agent.read.getPausedState(), false);
    });

    it("Should withdraw funds", async function () {
      const userInitialBalance = await viem.getBalance({ address: ownerAddress });
      const agentInitialBalance = await viem.getBalance({ address: agent.address });

      await agent.write.withdrawFunds({ account: owner.account });

      const userFinalBalance = await viem.getBalance({ address: ownerAddress });
      assert.ok(userFinalBalance > userInitialBalance);
    });

    it("Should add funds", async function () {
      const userInitialBalance = await viem.getBalance({ address: ownerAddress });
      const agentInitialBalance = await viem.getBalance({ address: agent.address });

      await agent.write.addFunds({ value: parseEther("2"), account: owner.account });

      const userFinalBalance = await viem.getBalance({ address: ownerAddress });
      const agentFinalBalance = await viem.getBalance({ address: agent.address });

      assert.ok(userInitialBalance - userFinalBalance === parseEther("2"));
      assert.ok(agentFinalBalance - agentInitialBalance === parseEther("2"));
    });

    it("Should get user funds", async function () {
      const userFunds = await agent.read.getUserFunds();
      assert.ok(userFunds > 0n);
    });

    it("Should get authorized signer", async function () {
      const signer = await agent.read.getAuthorizedSigner();
      assert.equal(signer.toLowerCase(), authorizedSigner.toLowerCase());
    });

    it("Should get owner", async function () {
      const agentOwner = await agent.read.getOwner();
      assert.equal(agentOwner.toLowerCase(), ownerAddress.toLowerCase());
    });

    it("Should get supported tokens", async function () {
      const tokens = await agent.read.getSupportedTokens();
      assert.equal(tokens.length, 3);
      assert.equal(tokens[0].toLowerCase(), dai.address.toLowerCase());
      assert.equal(tokens[1].toLowerCase(), weth.address.toLowerCase());
      assert.equal(tokens[2].toLowerCase(), mkr.address.toLowerCase());
    });

    it("Should get MockAMM address", async function () {
      const mockAMMAddress = await agent.read.getMockAMM();
      assert.equal(mockAMMAddress.toLowerCase(), mockAMM.address.toLowerCase());
    });
  });

  /*//////////////////////////////////////////////////////////////
                   DOMAIN SEPARATOR TESTS
  //////////////////////////////////////////////////////////////*/
  describe("Domain Separator", async function () {
    it("Should calculate domain separator correctly", async function () {
      const EIP712_DOMAIN_TYPEHASH = keccak256(
        encode([
          "string",
          "string",
          "uint256",
          "address",
        ],
          [
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)",
            "Agent",
            "1",
            BigInt(await viem.getChainId()),
            agent.address
          ]
        )
      );

      const domainSeparator = await agent.read.getDomainSeparator();
      assert.ok(domainSeparator.length > 0);
    });
  });
});

