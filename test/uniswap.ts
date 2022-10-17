import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, expect, network } from "hardhat";

describe("Uniswap", () => {
  let admin: SignerWithAddress, notAdmin: SignerWithAddress;
  let uniswapFactory: Contract,
    uniswapPair: Contract,
    token1: Contract,
    token2: Contract;

  before(async () => {
    [admin, notAdmin] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + admin.address);

    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    uniswapFactory = await UniswapV2Factory.deploy(admin.address);
    await uniswapFactory.deployed();

    const ERC20 = await ethers.getContractFactory("ERC20Test");
    token1 = await ERC20.deploy(100000);
    await token1.deployed();

    token2 = await ERC20.deploy(100000);
    await token2.deployed();
  });

  describe("UniswapFactory", () => {
    it("createPair", async () => {
      const createPairTx = await uniswapFactory.createPair(
        token1.address,
        token2.address
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
  });
});
