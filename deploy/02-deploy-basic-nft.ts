import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";
import { developmentChain, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployBasicNft = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  let chainId = network.config.chainId;

  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[chainId!].blockConfirmations || 1,
  });

  if (!developmentChain.includes(chainId!)) {
    await verify(basicNft.address, []);
  }
};

export default deployBasicNft;
deployBasicNft.tags = ["all", "basicnft"];
