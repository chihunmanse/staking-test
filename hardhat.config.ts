import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-truffle5";

const config: HardhatUserConfig = {
  solidity: { compilers: [{ version: "0.8.0" }, { version: "0.6.12" }] },
};

export default config;
