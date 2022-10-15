import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, expect, network } from "hardhat";

describe("Master Chef", () => {
  let admin: SignerWithAddress, notAdmin: SignerWithAddress;
  let masterChef: Contract, sushiToken: Contract;

  before(async () => {
    [admin, notAdmin] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + admin.address);

    const SushiToken = await ethers.getContractFactory("SushiToken");
    sushiToken = await SushiToken.deploy();
    await sushiToken.deployed();

    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Block Number: " + blockNumber);

    const MasterChef = await ethers.getContractFactory("MasterChef");
    masterChef = await MasterChef.deploy(
      sushiToken.address,
      admin.address,
      10,
      blockNumber,
      blockNumber + 10000
    );
  });

  describe("", () => {
    it("", async () => {
      console.log(masterChef.address);
      console.log(await masterChef.poolLength());
    });
  });
});
