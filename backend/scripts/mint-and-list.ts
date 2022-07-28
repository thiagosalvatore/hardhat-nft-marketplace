import { ethers, network } from "hardhat";
import moveBlocks from "../utils/moveBlocks";

async function main() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minting NFT");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log("Approving NFT");

  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);

  console.log("Listing NFT");
  const price = ethers.utils.parseEther("0.01");
  const listTx = await nftMarketplace.listItem(
    basicNft.address,
    tokenId,
    price
  );
  await listTx.wait(1);

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
