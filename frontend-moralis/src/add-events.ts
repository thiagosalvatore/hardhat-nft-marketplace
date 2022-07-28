require("dotenv").config();
const contractAddresses = require("../constants/networkMapping.json");
const Moralis = require("moralis/node");

let chainId = process.env.CHAIN_ID || "31337";
let moralisChainId = chainId == "31337" ? "1337" : chainId;
// @ts-ignore
const contractAddress: string = contractAddresses[chainId]["NftMarketplace"][0];

async function main() {
  await Moralis.start({
    serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
    appId: process.env.REACT_APP_MORALIS_APP_ID,
    masterKey: process.env.masterKey,
  });
  console.log("Working with contract address", contractAddress);
  let itemListedOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: "ItemListed(address, address, uint256, uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemListed",
      type: "event",
    },
    tableName: "ItemListed",
  };

  let itemBoughtOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: "ItemBought(address, address, uint256, uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "buyer",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemBought",
      type: "event",
    },
    tableName: "ItemBought",
  };

  let itemCanceledOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: "ItemCanceled(address, address, uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ItemCanceled",
      type: "event",
    },
    tableName: "ItemCanceled",
  };

  const listedResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemListedOptions,
    { useMasterKey: true }
  );

  const boughtResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemBoughtOptions,
    { useMasterKey: true }
  );

  const canceledResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemCanceledOptions,
    { useMasterKey: true }
  );

  if (
    listedResponse.success &&
    canceledResponse.success &&
    boughtResponse.success
  ) {
    console.log("Success!");
  } else {
    console.log("Something went wrong");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
