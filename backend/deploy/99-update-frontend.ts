import { ethers, network } from "hardhat";
import * as fs from "fs";

const frontendContractsFile =
  "../frontend-moralis/constants/networkMapping.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONTEND) {
    await updateContractAddresses();
  }
};
async function updateContractAddresses() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const chainId = network.config.chainId?.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontendContractsFile, "utf-8")
  );
  if (chainId! in contractAddresses) {
    if (
      !contractAddresses[chainId!]["NftMarketplace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId!]["NftMarketplace"].push(
        nftMarketplace.address
      );
    }
  } else {
    contractAddresses[chainId!] = { NftMarketplace: [nftMarketplace.address] };
  }
  fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];
