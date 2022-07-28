import { ethers, network } from "hardhat";
import moveBlocks from "../utils/moveBlocks";

const TOKEN_ID = "4";

async function main() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minting NFT");
  const cancelTx = await nftMarketplace.cancelListing(
    basicNft.address,
    TOKEN_ID
  );
  await cancelTx.wait(1);

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
