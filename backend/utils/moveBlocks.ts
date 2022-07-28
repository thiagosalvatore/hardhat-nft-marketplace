import { network } from "hardhat";

function sleep(timeInMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, timeInMs));
}

const moveBlocks = async (amount: number, sleepAmount: number = 0) => {
  console.log("Mining block...");
  for (let i = 0; i < amount; i++) {
    await network.provider.request({ method: "evm_mine", params: [] });
    if (sleepAmount > 0) {
      console.log("Sleeping for", sleepAmount);
      await sleep(sleepAmount);
    }
  }
};

export default moveBlocks;
