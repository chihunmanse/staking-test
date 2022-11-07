/** @format */

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, expect, network } from "hardhat";
import { getCurrentBlockTimestamp } from "./../helpers/block-timestamp";

describe("Uniswap", () => {
  let owner1: SignerWithAddress, owner2: SignerWithAddress;
  let uniswapRouter: Contract,
    uniswapFactory: Contract,
    uniswapPair: Contract,
    WETH: Contract,
    token0: Contract,
    token1: Contract;

  before(async () => {
    [owner1, owner2] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + owner1.address);

    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const UniswapV2FactoryBytecode =
      require("@uniswap/v2-core/build/UniswapV2Factory.json").bytecode;

    const Factory = new ethers.ContractFactory(
      UniswapV2Factory.interface,
      UniswapV2FactoryBytecode,
      owner1
    );
    uniswapFactory = await Factory.deploy(owner1.address);
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
    token0 = await ERC20.deploy(100000);
    await token0.deployed();

    token1 = await ERC20.deploy(100000);
    await token1.deployed();
  });

  describe("Liquidity", () => {
    it("Add Liquidity", async () => {
      const token0ApproveTx = await token0.approve(
        uniswapRouter.address,
        100000
      );
      await token0ApproveTx.wait();

      const token1ApproveTx = await token1.approve(
        uniswapRouter.address,
        100000
      );
      await token1ApproveTx.wait();

      console.log(await token0.balanceOf(owner1.address));

      const timestamp = await getCurrentBlockTimestamp();
      const addLiquidityTx = await uniswapRouter.addLiquidity(
        token0.address,
        token1.address,
        10,
        10,
        10,
        10,
        owner1.address,
        timestamp + 100
      );

      await addLiquidityTx.wait();

      expect(addLiquidityTx).to.emit(uniswapFactory, "PairCreated");
    });
  });
});
