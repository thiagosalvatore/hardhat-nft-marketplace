import { ethers, network } from "hardhat";
import moveBlocks from "../utils/moveBlocks";

const TOKEN_ID = "6";

async function main() {
  const accounts = await ethers.getSigners();
  const nftMarketplace = await ethers.getContract(
    "NftMarketplace",
    accounts[1]
  );
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minting NFT");
  const buyTx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
    value: ethers.utils.parseEther("0.01"),
  });
  await buyTx.wait(1);

  if (network.config.chainId == 31337) {
    await moveBlocks(2, 1000);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
