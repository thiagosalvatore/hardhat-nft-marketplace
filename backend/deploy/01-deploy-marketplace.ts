import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";
import { developmentChain, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployMarketplace = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  let chainId = network.config.chainId;

  const marketplaceNft = await deploy("NftMarketplace", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
  });

  if (!developmentChain.includes(chainId!)) {
    await verify(marketplaceNft.address, []);
  }
};

export default deployMarketplace;
deployMarketplace.tags = ["all", "marketplace"];
