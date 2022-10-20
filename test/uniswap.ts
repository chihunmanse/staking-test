import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, expect, network } from "hardhat";

describe("Uniswap", () => {
  let admin: SignerWithAddress, notAdmin: SignerWithAddress;
  let uniswapFactory: Contract,
    uniswapPair: Contract,
    token0: Contract,
    token1: Contract;

  before(async () => {
    [admin, notAdmin] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + admin.address);

    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    uniswapFactory = await UniswapV2Factory.deploy(admin.address);
    await uniswapFactory.deployed();

    const ERC20 = await ethers.getContractFactory("ERC20Test");
    token0 = await ERC20.deploy(100000);
    await token0.deployed();

    token1 = await ERC20.deploy(100000);
    await token1.deployed();
  });

  describe("UniswapFactory", () => {
    it("createPair", async () => {
      const createPairTx = await uniswapFactory.createPair(
        token0.address,
        token1.address
      );
      await createPairTx.wait();

      expect(createPairTx).to.emit(uniswapFactory, "PairCreated");
      const pairAddress = await uniswapFactory.allPairs(0);
      const UniswapPair = await ethers.getContractFactory("UniswapV2Pair");
      uniswapPair = new ethers.Contract(
        pairAddress,
        UniswapPair.interface,
        admin
      );
    });

    it("set token number", async () => {
      const token0Address = await uniswapPair.token0();
      const token1Address = await uniswapPair.token1();

      if (token0Address.toLowerCase() !== token0.address.toLowerCase()) {
        token0 = token1;
        token1 = token0;
      }

      expect(token0Address).to.equal(token0.address);
      expect(token1Address).to.equal(token1.address);
    });
  });
});
