/** @format */

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, expect, network } from "hardhat";
import { getCurrentBlockTimestamp } from "./../helpers/block-timestamp";

const MINIMUM_LIQUIDITY = 1000;

describe("Uniswap", () => {
  let feeTo: SignerWithAddress,
    owner1: SignerWithAddress,
    owner2: SignerWithAddress;
  let uniswapRouter: Contract,
    uniswapFactory: Contract,
    uniswapPair: Contract,
    WETH: Contract,
    tokenA: Contract,
    tokenB: Contract;
  let reserveA: number,
    reserveB: number,
    amountA: number,
    amountB: number,
    pairSupply: number,
    pairBalance: number;

  before(async () => {
    [feeTo, owner1, owner2] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + owner1.address);

    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const UniswapV2FactoryBytecode =
      require("@uniswap/v2-core/build/UniswapV2Factory.json").bytecode;

    const Factory = new ethers.ContractFactory(
      UniswapV2Factory.interface,
      UniswapV2FactoryBytecode,
      feeTo
    );
    uniswapFactory = await Factory.deploy(feeTo.address);
    await uniswapFactory.deployed();

    const WETH9 = await ethers.getContractFactory("WETH9");
    WETH = await WETH9.deploy();
    await WETH.deployed();

    const UniswapV2Router = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    uniswapRouter = await UniswapV2Router.deploy(
      uniswapFactory.address,
      WETH.address
    );
    await uniswapRouter.deployed();

    const ERC20 = await ethers.getContractFactory("ERC20Test");
    tokenA = await ERC20.deploy("100000000000000000000000");
    await tokenA.deployed();

    tokenB = await ERC20.deploy("100000000000000000000000");
    await tokenB.deployed();

    const tokenAApproveTx = await tokenA.approve(
      uniswapRouter.address,
      "100000000000000000000000"
    );
    await tokenAApproveTx.wait();

    const tokenBApproveTx = await tokenB.approve(
      uniswapRouter.address,
      "100000000000000000000000"
    );
    await tokenBApproveTx.wait();
  });

  describe("Liquidity", () => {
    it("First Add Liquidity", async () => {
      amountA = 10000;
      amountB = 10000;

      const timestamp = await getCurrentBlockTimestamp();
      const addLiquidityTx = await uniswapRouter.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        10,
        10,
        owner1.address,
        Number(timestamp) + 100
      );
      await addLiquidityTx.wait();

      const pair = await uniswapFactory.getPair(tokenA.address, tokenB.address);
      const Pair = await ethers.getContractFactory("UniswapV2Pair");
      uniswapPair = new ethers.Contract(pair, Pair.interface, owner1);

      pairSupply = await uniswapPair.totalSupply();
      pairBalance = await uniswapPair.balanceOf(owner1.address);
      const reserves = await uniswapPair.getReserves();
      const token0Address = await uniswapPair.token0();

      const token0 = tokenA;
      const token1 = tokenB;
      if (token0Address.toLowerCase() !== tokenA.address.toLowerCase()) {
        tokenA = token1;
        tokenB = token0;
      }

      reserveA = reserves[0].toNumber();
      reserveB = reserves[1].toNumber();

      expect(addLiquidityTx).to.emit(uniswapFactory, "PairCreated");
      expect(pairSupply).to.equal(Math.sqrt(amountA * amountB));
      expect(pairBalance).to.equal(
        Math.sqrt(amountA * amountB) - MINIMUM_LIQUIDITY
      );
      expect(reserveA).to.equal(amountA);
      expect(reserveB).to.equal(amountB);
    });
  });
});
