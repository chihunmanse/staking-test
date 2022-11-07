/** @format */

import { network, ethers } from "hardhat";

export const setNextBlockTimestamp = async (timestamp: number) => {
  const blockNumber = await ethers.provider.getBlockNumber();
  const now = (await ethers.provider.getBlock(blockNumber)).timestamp;

  await network.provider.send("evm_setNextBlockTimestamp", [now + timestamp]);
  await network.provider.send("evm_mine");
};

export const getCurrentBlockTimestamp = async () => {
  const blockNumber = await ethers.provider.getBlockNumber();
  return (await ethers.provider.getBlock(blockNumber)).timestamp;
};

export const getBlockTimestamp = async (blockNumber: number) => {
  return (await ethers.provider.getBlock(blockNumber)).timestamp;
};
